import { Router } from "express";
import {
  registerUser,
  loginUser,
  refreshAccessToken,
} from "../controllers/auth.controller.js";

const router = Router();

// Register 
router.post("/register", registerUser);

//login 
router.post("/login", loginUser);

router.post("/refresh-token", refreshAccessToken);

router.post("/logout", verifyJWT, logoutUser);

export default router;
