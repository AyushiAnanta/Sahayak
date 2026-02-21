import { Router } from "express";
import {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser // <-- ADDED THIS HERE
} from "../controllers/auth.controller.js";

// ADD YOUR MIDDLEWARE IMPORT HERE
// (Make sure this path matches where your actual middleware file is located!)
import { verifyJWT } from "../middlewares/auth.middleware.js"; 

const router = Router();

// Register 
router.post("/register", registerUser);

//login 
router.post("/login", loginUser);

router.post("/refresh-token", refreshAccessToken);

router.post("/logout", verifyJWT, logoutUser);

export default router;