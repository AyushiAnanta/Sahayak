import { AIProcessingLog } from "../models/aiProcessingLog.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getAILog = asyncHandler(async (req, res) => {
  const log = await AIProcessingLog.findOne({ grievanceId: req.params.grievanceId });
  if (!log) throw new ApiError(404, "AI processing log not found");
  return res.status(200).json(new ApiResponse(200, log));
});