import { Router } from "express";
import {
  getAllDepartments,
  getDepartmentById,
  getDepartmentGrievances,
  getOfficersByDepartment,
} from "../controllers/department.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.get("/all",              getAllDepartments);
router.get("/:id",              getDepartmentById);
router.get("/:id/grievances",   authorizeRoles("admin", "officer", "department"), getDepartmentGrievances);
router.get("/:departmentId/officers", getOfficersByDepartment);
export default router;