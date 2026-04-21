import { Router } from "express";
import {
  getAllGrievances,
  getPendingGrievances,
  assignGrievance,
  updateGrievanceStatus,
  getMonthlyStats,
  getAdminNotifications,
  getUserStats,
} from "../controllers/admin.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT); // ✅ only verify JWT globally, NOT role

// admin only
router.get("/grievances",         authorizeRoles("admin"),                getAllGrievances);
router.get("/grievances/pending", authorizeRoles("admin"),                getPendingGrievances);
router.get("/stats/monthly",      authorizeRoles("admin"),                getMonthlyStats);
router.get("/notifications",      authorizeRoles("admin"),                getAdminNotifications);
router.get("/stats/users",        authorizeRoles("admin"),                getUserStats);

// admin + department
router.put("/assign/:id",         authorizeRoles("admin", "department"),  assignGrievance);
router.put("/status/:id",         authorizeRoles("admin", "department"),  updateGrievanceStatus);

export default router;