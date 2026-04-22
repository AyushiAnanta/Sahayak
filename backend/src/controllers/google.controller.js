import { asyncHandler } from "../utils/asyncHandler.js";
import { generateTokens } from "../utils/token.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const googleCallback = asyncHandler(async (req, res) => {
  const user = req.user;

  const { accessToken, refreshToken } = generateTokens(user);

  // (optional) still keep cookies if you want
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  // ✅ CRITICAL: send token + role to frontend
  return res.redirect(
  `http://localhost:5173/google-success?token=${accessToken}&role=${user.role || "user"}`
);
});