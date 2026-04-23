import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { generateTokens } from "../utils/token.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const registerUser = asyncHandler(async (req, res) => {
  const { username, name, email, password, role, departmentId} = req.body;

  console.log("📝 REGISTER REQUEST:", req.body);

  // VALIDATION
  if (!username || !email || !password || !name) {
    throw new ApiError(400, "All fields are required");
  }

  // CHECK EXISTING USERS
  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    console.log("❌ Email already exists");
    throw new ApiError(409, "Email already registered");
  }

  const existingUsername = await User.findOne({ username });
  if (existingUsername) {
    console.log("❌ Username already exists");
    throw new ApiError(409, "Username not available");
  }

  // ROLE CONTROL
  const allowedRoles = ["user", "officer", "department"]; 
  const finalRole = allowedRoles.includes(role) ? role : "user";
  if ((finalRole === "officer" || finalRole === "department") && !departmentId) {
  throw new ApiError(400, "departmentId is required for officer");
  }
  const user = await User.create({
    username,
    name,
    email,
    password,
    role: finalRole,
    ...( (finalRole === "officer" || finalRole === "department") && { departmentId }),
  });

  console.log("✅ USER CREATED:", user.email, "| ROLE:", user.role);

  return res.status(201).json({
    success: true,
    user: {
      id: user._id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    message: "User registered successfully",
  });
});


export const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  console.log("🔐 LOGIN REQUEST:", req.body);

  const identifier = email || username;

  if (!identifier || !password) {
    throw new ApiError(400, "Email/Username and password required");
  }

  const query = identifier.includes("@")
    ? { email: identifier }
    : { username: identifier };

  const user = await User.findOne(query).select("+password +refreshToken");

  if (!user) {
    console.log("❌ USER NOT FOUND");
    throw new ApiError(404, "User not found");
  }

  console.log("👤 USER FOUND:", user.email, "| ROLE:", user.role);

  const isCorrect = await user.isPasswordCorrect(password);

  if (!isCorrect) {
    console.log("❌ PASSWORD WRONG");
    throw new ApiError(401, "Invalid credentials");
  }

  console.log("✅ PASSWORD MATCH");

  const { accessToken, refreshToken } = generateTokens(user);

  await User.findByIdAndUpdate(
    user._id,
    { $set: { refreshToken } },
    { returnDocument: "after" } 
  );

  const cookieOptions = {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
  };

  res
    .cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 1000 * 60 * 15,
    })
    .cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

  console.log("🚀 LOGIN SUCCESS:", { id: user._id, role: user.role });

  return res.status(200).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
      departmentId: user.departmentId || null, 
    },
    message: "Login successful",
  });
});

export const logoutUser = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) throw new ApiError(401, "Not authenticated");

  await User.findByIdAndUpdate(
    userId,
    { $set: { refreshToken: "" } },
    { new: true }
  );

  const cookieOptions = {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
  };

  res
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions);

  return res.status(200).json(new ApiResponse(200, {}, "Logged out successfully"));
});


export const getCurrentUser = asyncHandler(async (req, res) => {
  return res.status(200).json(new ApiResponse(200, req.user));
});


export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken;
  if (!incomingRefreshToken) throw new ApiError(401, "Refresh token missing");

  let decoded;
  try {
    decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
  } catch {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const user = await User.findById(decoded._id).select("+refreshToken");
  if (!user) throw new ApiError(404, "User not found");

  if (user.refreshToken !== incomingRefreshToken) {
    throw new ApiError(401, "Refresh token mismatch — please log in again");
  }

  const { accessToken } = generateTokens(user);

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
    maxAge: 1000 * 60 * 15,
  });

  return res.status(200).json(
    new ApiResponse(200, { accessToken }, "New access token issued")
  );
});