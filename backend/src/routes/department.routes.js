import { Router } from "express";
import {
  getAllDepartments,
  getDepartmentById,
  getDepartmentGrievances,
} from "../controllers/department.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.get("/all",              getAllDepartments);
router.get("/:id",              getDepartmentById);
router.get("/:id/grievances",   authorizeRoles("admin", "officer"), getDepartmentGrievances);

export default router;