import { Router } from "express";
import { getStatusHistory, addStatusLog } from "../controllers/statusLog.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.get("/:grievanceId",  getStatusHistory);
router.put("/:grievanceId",  authorizeRoles("admin"), addStatusLog);

export default router;