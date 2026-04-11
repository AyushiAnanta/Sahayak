import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { generateTokens } from "../utils/token.js";
import { asyncHandler } from "../utils/asyncHandler.js";


// REGISTER USER — creates a new account, does not log in
export const registerUser = asyncHandler(async (req, res) => {
  const { username, name, email, password, role } = req.body;

  if (!username || !email || !password || !name) {
    throw new ApiError(400, "All fields are required");
  }

  const existingEmail = await User.findOne({ email });
  if (existingEmail) throw new ApiError(409, "Email already registered");

  const existingUsername = await User.findOne({ username });
  if (existingUsername) throw new ApiError(409, "Username not available");

  const user = await User.create({
    username,
    name,
    email,
    password,
    role: role || "user",
  });

  return res.status(201).json(
    new ApiResponse(201, {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    }, "User registered successfully")
  );
});


// LOGIN USER — validates credentials, saves tokens to DB, sets httpOnly cookies
export const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  const identifier = email || username;
  if (!identifier || !password)
    throw new ApiError(400, "Email/Username and password required");

  const query = identifier.includes("@")
    ? { email: identifier }
    : { username: identifier };

  // Must explicitly select +password and +refreshToken since both are select:false
  const user = await User.findOne(query).select("+password +refreshToken");

  if (!user) throw new ApiError(404, "User not found");

  const isCorrect = await user.isPasswordCorrect(password);
  if (!isCorrect) throw new ApiError(401, "Invalid credentials");

  const { accessToken, refreshToken } = generateTokens(user);

  // Use findByIdAndUpdate instead of user.save() — avoids select:false field issues
  // and prevents the password pre-save hook from re-hashing on every login
  await User.findByIdAndUpdate(
    user._id,
    { $set: { refreshToken } },
    { new: true }
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
      maxAge: 1000 * 60 * 15,           // 15 minutes
    })
    .cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });

  return res.status(200).json(
    new ApiResponse(200, {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    }, "Login successful")
  );
});


// LOGOUT — clears refreshToken from DB and clears both cookies
export const logoutUser = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) throw new ApiError(401, "Not authenticated");

  // Wipe refreshToken from DB
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


// CURRENT USER — returns the user object attached by verifyJWT middleware
export const getCurrentUser = asyncHandler(async (req, res) => {
  return res.status(200).json(new ApiResponse(200, req.user));
});


// REFRESH ACCESS TOKEN — issues a new accessToken using the refreshToken cookie
export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken;
  if (!incomingRefreshToken) throw new ApiError(401, "Refresh token missing");

  let decoded;
  try {
    decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
  } catch {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  // Fetch user and explicitly select refreshToken since it is select:false
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