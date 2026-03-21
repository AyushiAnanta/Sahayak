import { Router } from "express";
import passport from "passport";
import "../config/passport.config.js";
import { googleCallback } from "../controllers/google.controller.js";

const router = Router();

// Redirect to Google
router.get(
  "/",
  passport.authenticate("google", {
    scope: ["profile", "email"]
  })
);

// Callback
router.get(
  "/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=oauth_failed`,
  }),
  googleCallback
);

export default router;