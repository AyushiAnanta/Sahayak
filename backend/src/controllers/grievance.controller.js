import { Grievance } from "../models/grievance.model.js";
import { Notification } from "../models/notification.model.js";
import { StatusLog } from "../models/statusLog.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


// POST /api/grievance/create — creates a new grievance for the logged-in user
export const createGrievance = asyncHandler(async (req, res) => {
  const { inputType, originalText, originalLanguage, translatedText, district, pincode } = req.body;

  if (!inputType || !originalText || !originalLanguage || !translatedText || !district || !pincode) {
    throw new ApiError(400, "inputType, originalText, originalLanguage, translatedText, district and pincode are required");
  }

  const grievance = await Grievance.create({
    userId: req.user._id,
    inputType,
    originalText,
    originalLanguage,
    translatedText,
    district,
    pincode,
    status: "pending",
    is_deleted: false,
  });

  // Notify user that grievance was received
  await Notification.create({
    userId: req.user._id,
    grievanceId: grievance._id,
    message: `Your grievance has been submitted. ID: ${grievance._id}`,
    notification_type: "Initiated",
    status: "unread",
  });

  return res.status(201).json(new ApiResponse(201, grievance, "Grievance created successfully"));
});


// GET /api/grievance/all — fetches all non-deleted grievances of the logged-in user with pagination
export const getUserGrievances = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;

  const filter = { userId: req.user._id, is_deleted: false };
  if (status) filter.status = status;

  const grievances = await Grievance.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .populate("departmentId", "name email")
    .populate("assignedOfficerId", "name username");

  const total = await Grievance.countDocuments(filter);

  return res.status(200).json(new ApiResponse(200, { grievances, total, page: Number(page) }));
});


// GET /api/grievance/:id — fetches a single grievance by id, must belong to the logged-in user
export const getGrievanceById = asyncHandler(async (req, res) => {
  const grievance = await Grievance.findOne({
    _id: req.params.id,
    userId: req.user._id,
    is_deleted: false,
  })
    .populate("departmentId", "name email phone deptHead")
    .populate("assignedOfficerId", "name username email");

  if (!grievance) throw new ApiError(404, "Grievance not found");

  return res.status(200).json(new ApiResponse(200, grievance));
});


// PUT /api/grievance/:id/edit — allows user to edit originalText/district/pincode only while status is pending
export const editGrievance = asyncHandler(async (req, res) => {
  const grievance = await Grievance.findOne({
    _id: req.params.id,
    userId: req.user._id,
    is_deleted: false,
  });

  if (!grievance) throw new ApiError(404, "Grievance not found");
  if (grievance.status !== "pending") throw new ApiError(400, "Only pending grievances can be edited");

  const { originalText, district, pincode } = req.body;
  if (originalText) grievance.originalText = originalText;
  if (district) grievance.district = district;
  if (pincode) grievance.pincode = pincode;

  await grievance.save();

  return res.status(200).json(new ApiResponse(200, grievance, "Grievance updated successfully"));
});


// DELETE /api/grievance/:id — soft deletes a grievance by setting is_deleted = true
export const deleteGrievance = asyncHandler(async (req, res) => {
  const grievance = await Grievance.findOne({
    _id: req.params.id,
    userId: req.user._id,
    is_deleted: false,
  });

  if (!grievance) throw new ApiError(404, "Grievance not found");

  grievance.is_deleted = true;
  await grievance.save();

  return res.status(200).json(new ApiResponse(200, {}, "Grievance deleted successfully"));
});


// GET /api/grievance/:id/status — returns just the current status field of a grievance
export const getGrievanceStatus = asyncHandler(async (req, res) => {
  const grievance = await Grievance.findOne({
    _id: req.params.id,
    userId: req.user._id,
    is_deleted: false,
  }).select("status updatedAt departmentId assignedOfficerId");

  if (!grievance) throw new ApiError(404, "Grievance not found");

  return res.status(200).json(new ApiResponse(200, grievance));
});


// POST /api/grievance/upload — uploads a file to cloudinary via multer and returns the URL
export const uploadGrievanceFile = asyncHandler(async (req, res) => {
  const localPath = req.file?.path;
  if (!localPath) throw new ApiError(400, "No file provided");

  const uploaded = await uploadOnCloudinary(localPath);
  if (!uploaded) throw new ApiError(500, "Cloudinary upload failed");

  return res.status(200).json(new ApiResponse(200, { url: uploaded.url, public_id: uploaded.public_id }, "File uploaded"));
});