import { Router } from "express";
import passport from "passport";
import "../config/passport.config.js";   // ✔ Correct path
import { googleCallback } from "../controllers/google.controller.js";

const router = Router();

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  googleCallback
);

export default router;
