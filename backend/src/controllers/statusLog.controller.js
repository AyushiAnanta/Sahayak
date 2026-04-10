import { StatusLog } from "../models/statusLog.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


// GET /api/status-log/:grievanceId — returns full status change history for a grievance, oldest first
export const getStatusHistory = asyncHandler(async (req, res) => {
  const logs = await StatusLog.find({ grievanceId: req.params.grievanceId })
    .sort({ createdAt: 1 })
    .populate("changedByUserId", "name username role");

  return res.status(200).json(new ApiResponse(200, logs));
});


// PUT /api/status-log/:grievanceId — admin manually inserts a status log entry for audit trail
export const addStatusLog = asyncHandler(async (req, res) => {
  const { oldStatus, newStatus, remark } = req.body;

  if (!oldStatus || !newStatus) throw new ApiError(400, "oldStatus and newStatus are required");

  const log = await StatusLog.create({
    grievanceId: req.params.grievanceId,
    userId: req.user._id,
    changedByUserId: req.user._id,
    oldStatus,
    newStatus,
    remark: remark || "",
  });

  return res.status(201).json(new ApiResponse(201, log, "Status log added"));
});