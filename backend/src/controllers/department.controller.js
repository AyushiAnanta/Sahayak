import mongoose from "mongoose";
import Department from "../models/department.model.js";
import Grievance from "../models/grievance.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";


// GET ALL DEPARTMENTS 
export const getAllDepartments = asyncHandler(async (req, res) => {
  const departments = await Department.find().sort({ name: 1 });

  return res.status(200).json(
    new ApiResponse(200, departments, "Departments fetched successfully")
  );
});


// GET DEPARTMENT BY ID 
export const getDepartmentById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid department ID");
  }

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

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid department ID");
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const grievances = await Grievance.find({ department: id })
    .populate("user", "name email")
    .populate("department", "name")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

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

  const existing = await Department.findOne({
    name: { $regex: `^${name}$`, $options: "i" }
  });

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


//  UPDATE DEPARTMENT
export const updateDepartment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid department ID");
  }

  const department = await Department.findById(id);

  if (!department) {
    throw new ApiError(404, "Department not found");
  }

  if (name) {
    const exists = await Department.findOne({
      name: { $regex: `^${name}$`, $options: "i" },
      _id: { $ne: id }
    });

    if (exists) {
      throw new ApiError(400, "Department with this name already exists");
    }

    department.name = name;
  }

  if (description) department.description = description;

  await department.save();

  return res.status(200).json(
    new ApiResponse(200, department, "Department updated successfully")
  );
});


// DELETE DEPARTMENT
export const deleteDepartment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid department ID");
  }

  const department = await Department.findById(id);

  if (!department) {
    throw new ApiError(404, "Department not found");
  }

  const hasGrievances = await Grievance.exists({ department: id });

  if (hasGrievances) {
    throw new ApiError(
      400,
      "Cannot delete department with assigned grievances"
    );
  }

  await department.deleteOne();

  return res.status(200).json(
    new ApiResponse(200, null, "Department deleted successfully")
  );
});


//  ADD OFFICER TO DEPARTMENT 
export const addOfficerToDepartment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { officerId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(officerId)) {
    throw new ApiError(400, "Invalid ID");
  }

  const department = await Department.findById(id);

  if (!department) {
    throw new ApiError(404, "Department not found");
  }

  if (department.officers.includes(officerId)) {
    throw new ApiError(400, "Officer already exists in department");
  }

  department.officers.push(officerId);
  await department.save();

  return res.status(200).json(
    new ApiResponse(200, department, "Officer added to department")
  );
});


//  REMOVE OFFICER 
export const removeOfficerFromDepartment = asyncHandler(async (req, res) => {
  const { id, officerId } = req.params;

  const department = await Department.findById(id);

  if (!department) {
    throw new ApiError(404, "Department not found");
  }

  department.officers = department.officers.filter(
    (off) => off.toString() !== officerId
  );

  await department.save();

  return res.status(200).json(
    new ApiResponse(200, department, "Officer removed from department")
  );
});