import { asyncHandler } from "../utils/asyncHandler.js";
import { generateTokens } from "../utils/token.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const googleCallback = asyncHandler(async (req, res) => {
  const user = req.user;

  const { accessToken, refreshToken } = generateTokens(user);

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.redirect("http://localhost:3000/dashboard"); 
});
