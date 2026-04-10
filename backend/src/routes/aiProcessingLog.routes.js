import { Router } from "express";
import { getAILog } from "../controllers/aiProcessingLog.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.get("/:grievanceId", getAILog);

export default router;