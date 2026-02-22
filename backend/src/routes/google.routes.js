import { Router } from "express";
import passport from "passport";
import "../config/passport.config.js";  
import { googleCallback } from "../controllers/google.controller.js";

const router = Router();

router.get(
  "/",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/callback",
  passport.authenticate("google", { session: false }),
  googleCallback
);

export default router;
