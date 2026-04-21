import { Router } from "express";
import {
  getAssignedTasks,
  updateTaskProgress,
  completeTask,
  getOfficersByDepartment,
} from "../controllers/officer.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT, authorizeRoles("officer", "admin", "department"));

router.get("/by-department/:deptId", getOfficersByDepartment);
router.get("/tasks",                 getAssignedTasks);
router.put("/tasks/:id/progress",    updateTaskProgress);
router.put("/tasks/:id/complete",    completeTask);

export default router;