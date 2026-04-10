import { Router } from "express";
import { getAssignedTasks, updateTaskProgress, completeTask } from "../controllers/officer.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();

// officer and admin can both access these
router.use(verifyJWT, authorizeRoles("officer", "admin"));

router.get("/tasks",               getAssignedTasks);
router.put("/tasks/:id/progress",  updateTaskProgress);
router.put("/tasks/:id/complete",  completeTask);

export default router;