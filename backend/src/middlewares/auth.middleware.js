import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  console.log(" Incoming Cookies:", req.cookies);

  const token =
    req.cookies?.accessToken ||
    req.headers.authorization?.replace("Bearer ", "");

  console.log(" Access Token Received:", token);

  if (!token) {
    throw new ApiError(401, "Access token missing");
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    console.log(" Access Token Valid → User:", decoded.id);

    
   const userId = decoded.id || decoded._id;

if (!userId) throw new ApiError(401, "Invalid token payload");

const user = await User.findById(userId).lean();

    req.user = user;
    return next();

  } catch (error) {
    console.log("⚠ Access Token Error:", error.name);

    if (error.name === "TokenExpiredError") {
      const refreshToken = req.cookies?.refreshToken;
      console.log("Refresh Token Present:", !!refreshToken);

      if (!refreshToken) {
        console.log(" No Refresh Token Found");
        throw new ApiError(401, "Session expired. Please login again.");
      }

      try {
        const decodedRefresh = jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET
        );

        const user = await User.findById(decodedRefresh.id).lean();

        if (!user) {
          console.log("Refresh token user not found");
          throw new ApiError(401, "Invalid refresh token");
        }

        const newAccessToken = jwt.sign(
          { id: user._id },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "15m" }
        );

        console.log(" New Access Token Generated");

        res.cookie("accessToken", newAccessToken, {
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

        req.user = user;
        return next();

      } catch (refreshErr) {
        console.log(" Refresh Token Verification Failed", refreshErr);
        throw new ApiError(401, "Session expired. Login again.");
      }
    }

    throw new ApiError(401, "Invalid token");
  }
});
