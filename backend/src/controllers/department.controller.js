import Department from "../models/department.model.js";
import Grievance from "../models/grievance.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// GET ALL DEPARTMENTS
export const getAllDepartments = asyncHandler(async (req, res) => {
  const departments = await Department.find();

  return res.status(200).json(
    new ApiResponse(200, departments, "Departments fetched successfully")
  );
});

//GET DEPARTMENT BY ID
export const getDepartmentById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const department = await Department.findById(id);

  if (!department) {
    throw new ApiError(404, "Department not found");
  }

  return res.status(200).json(
    new ApiResponse(200, department, "Department fetched successfully")
  );
});

//GET GRIEVANCES OF DEPARTMENT
export const getDepartmentGrievances = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const grievances = await Grievance.find({ department: id })
    .populate("user", "name email")
    .populate("department", "name");

  return res.status(200).json(
    new ApiResponse(200, grievances, "Department grievances fetched")
  );
});

// CREATE DEPARTMENT
export const createDepartment = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    throw new ApiError(400, "Department name is required");
  }

  const existing = await Department.findOne({ name });

  if (existing) {
    throw new ApiError(400, "Department already exists");
  }

  const department = await Department.create({
    name,
    description,
  });

  return res.status(201).json(
    new ApiResponse(201, department, "Department created successfully")
  );
});


//UPDATE DEPARTMENT 
export const updateDepartment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  const department = await Department.findById(id);

  if (!department) {
    throw new ApiError(404, "Department not found");
  }

  if (name) department.name = name;
  if (description) department.description = description;

  await department.save();

  return res.status(200).json(
    new ApiResponse(200, department, "Department updated successfully")
  );
});

// DELETE DEPARTMENT
export const deleteDepartment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const department = await Department.findById(id);

  if (!department) {
    throw new ApiError(404, "Department not found");
  }

  await department.deleteOne();

  return res.status(200).json(
    new ApiResponse(200, null, "Department deleted successfully")
  );
});