import { Router } from "express";
import { healthCheck, getLocations, getSupportedLanguages } from "../controllers/misc.controller.js";

const router = Router();

router.get("/health",     healthCheck);
router.get("/location",   getLocations);
router.get("/languages",  getSupportedLanguages);
export default router;