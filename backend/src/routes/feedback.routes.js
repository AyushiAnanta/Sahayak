import { Router } from "express";
import { submitFeedback, getFeedback } from "../controllers/feedback.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.post("/:grievanceId",  submitFeedback);
router.get("/:grievanceId",   getFeedback);

export default router;