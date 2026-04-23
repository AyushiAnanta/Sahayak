import { Router } from "express";
import {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  getCurrentUser
} from "../controllers/auth.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Refresh access token
router.post("/refresh-token", refreshAccessToken);

// Logout
router.post("/logout", verifyJWT, logoutUser);

// Current user 
router.get("/me", verifyJWT, getCurrentUser);

export default router;
