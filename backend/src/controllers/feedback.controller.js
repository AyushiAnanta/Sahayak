import { Feedback } from "../models/feedback.model.js";
import { Grievance } from "../models/grievance.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


// POST /api/feedback/:grievanceId — submits a rating + comment; if resolved=false, reopens the grievance
export const submitFeedback = asyncHandler(async (req, res) => {
  const { rating, resolved, comments } = req.body;
  const { grievanceId } = req.params;

  if (resolved === undefined) throw new ApiError(400, "resolved field is required");

  const grievance = await Grievance.findOne({
    _id: grievanceId,
    userId: req.user._id,
    is_deleted: false,
  });
  if (!grievance) throw new ApiError(404, "Grievance not found");

  // If user rejects the resolution, reopen the grievance
  if (resolved === false || resolved === "false") {
    grievance.status = "pending";
    await grievance.save();
  }

  const feedback = await Feedback.create({
    userId: req.user._id,
    grievanceId,
    rating,
    resolved,
    comments: comments ? [comments] : [],
  });

  return res.status(201).json(new ApiResponse(201, feedback, "Feedback submitted"));
});


// GET /api/feedback/:grievanceId — retrieves feedback for a specific grievance
export const getFeedback = asyncHandler(async (req, res) => {
  const feedback = await Feedback.findOne({ grievanceId: req.params.grievanceId })
    .populate("userId", "name username");

  if (!feedback) throw new ApiError(404, "Feedback not found");

  return res.status(200).json(new ApiResponse(200, feedback));
});