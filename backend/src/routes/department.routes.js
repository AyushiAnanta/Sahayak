import express from "express";
import {
  getAllDepartments,
  getDepartmentById,
  getDepartmentGrievances,
  createDepartment,
  updateDepartment,
  deleteDepartment
} from "../controllers/department.controller.js";

import { protect, isAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();


// Get all departments
router.get("/", getAllDepartments); 

// Get single department
router.get("/:id", getDepartmentById); 


// Get grievances of a department
router.get("/:id/grievances", protect, getDepartmentGrievances); 


// Create department
router.post("/", protect, isAdmin, createDepartment); 

// Update department
router.put("/:id", protect, isAdmin, updateDepartment); 

// Delete department
router.delete("/:id", protect, isAdmin, deleteDepartment); 


export default router;