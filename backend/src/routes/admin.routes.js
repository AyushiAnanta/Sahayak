import { Router } from "express";
import {
  getAllGrievances,
  getPendingGrievances,
  assignGrievance,
  updateGrievanceStatus,
  getMonthlyStats,
  getAdminNotifications,
} from "../controllers/admin.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();

// every admin route requires login + admin role
router.use(verifyJWT, authorizeRoles("admin"));

router.get("/grievances",         getAllGrievances);
router.get("/grievances/pending", getPendingGrievances);
router.put("/assign/:id",         assignGrievance);
router.put("/status/:id",         updateGrievanceStatus);
router.get("/stats/monthly",      getMonthlyStats);
router.get("/notifications",      getAdminNotifications);

export default router;