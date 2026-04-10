import { Router } from "express";
import { translate, classify, summarize, detectDuplicate, explain } from "../controllers/ai.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.post("/translate",         translate);
router.post("/classify",          classify);
router.post("/summarize",         summarize);
router.post("/detect-duplicate",  detectDuplicate);
router.post("/explain",           explain);

export default router;