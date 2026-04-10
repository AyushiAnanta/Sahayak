import { Notification } from "../models/notification.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


// GET /api/notification — fetches all notifications for the logged-in user, newest first
export const getUserNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate("grievanceId", "status district");

  return res.status(200).json(new ApiResponse(200, notifications));
});


// PUT /api/notification/:id/read — marks a single notification as read
export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!notification) throw new ApiError(404, "Notification not found");

  notification.status = "read";
  await notification.save();

  return res.status(200).json(new ApiResponse(200, notification, "Marked as read"));
});


// POST /api/notification/send — admin creates and sends a notification to any user (in-app only)
export const sendNotification = asyncHandler(async (req, res) => {
  // notification_type must be one of: Update | Under Process | Completed | Initiated | Dropped
  const { userId, grievanceId, message, notification_type } = req.body;

  if (!userId || !grievanceId || !message || !notification_type) {
    throw new ApiError(400, "userId, grievanceId, message and notification_type are required");
  }

  const notification = await Notification.create({
    userId,
    grievanceId,
    message,
    notification_type,
    status: "unread",
  });

  return res.status(201).json(new ApiResponse(201, notification, "Notification sent"));
});