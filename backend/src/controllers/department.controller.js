import { Department } from "../models/department.model.js";
import { Grievance } from "../models/grievance.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


// GET /api/department/all
export const getAllDepartments = asyncHandler(async (req, res) => {
  const departments = await Department.find().sort({ name: 1 });
  return res.status(200).json(new ApiResponse(200, departments));
});


// GET /api/department/:id 
export const getDepartmentById = asyncHandler(async (req, res) => {
  const department = await Department.findById(req.params.id);
  if (!department) throw new ApiError(404, "Department not found");
  return res.status(200).json(new ApiResponse(200, department));
});


// GET /api/department/:id/grievances 
export const getDepartmentGrievances = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;

  const filter = { departmentId: req.params.id, is_deleted: false };
  if (status) filter.status = status;

  const grievances = await Grievance.find(filter)
    .sort({ priorityScore: -1, createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .populate("userId", "name username email")
    .populate("assignedOfficerId", "name username");

  const total = await Grievance.countDocuments(filter);

  return res.status(200).json(new ApiResponse(200, { grievances, total, page: Number(page) }));
});

export const getOfficersByDepartment = asyncHandler(async (req, res) => {
  const { departmentId } = req.params;

  const officers = await User.find({
    role: "officer",
    departmentId,
  }).select("name email");

  return res.status(200).json({
    success: true,
    officers,
  });
});