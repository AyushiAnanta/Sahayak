import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { generateTokens } from "../utils/token.js";
import { asyncHandler } from "../utils/asyncHandler.js";


//   REGISTER USER
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
    })
  );
});


// LOGIN 
export const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if ((!email && !username) || !password)
    throw new ApiError(400, "Email/Username and password are required");

  const user = await User.findOne({ $or: [{ email }, { username }] }).select(
    "+password"
  );

  if (!user) throw new ApiError(404, "User not found");

  const isCorrect = await user.isPasswordCorrect(password);
  if (!isCorrect) throw new ApiError(401, "Invalid credentials");

  const { accessToken, refreshToken } = generateTokens(user);

  user.refreshToken = refreshToken;
  await user.save();

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  };

  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
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
    })
  );
});


// LOGOUT
export const logoutUser = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(401, "Not authenticated");

  await User.findByIdAndUpdate(userId, { refreshToken: "" });

  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
  });

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
  });

  return res.status(200).json(
    new ApiResponse(200, {}, "Logged out successfully")
  );
});


export const getCurrentUser = (req, res) => {
  return res.status(200).json({
    success: true,
    data: req.user,
  });
};

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const refreshToken =
    req.cookies?.refreshToken || req.body.refreshToken;

  if (!refreshToken) throw new ApiError(401, "Refresh token missing");

  let decoded;

  try {
    decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
  } catch (e) {
    throw new ApiError(401, "Invalid refresh token");
  }

  const user = await User.findById(decoded.id);
  if (!user) throw new ApiError(404, "User does not exist");


  if (user.refreshToken && user.refreshToken !== refreshToken)
    throw new ApiError(401, "Invalid refresh token");

  const { accessToken } = generateTokens(user);

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 15 * 60 * 1000,
  });
  
  res.cookie("refreshToken", refreshToken, {
  httpOnly: true,
  secure: false,
  sameSite: "lax",
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

  return res.status(200).json(
    new ApiResponse(200, { accessToken }, "New access token generated")
  );
});
