import { Notification } from "../models/notification.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendEmailNotification } from "../utils/email.js";


const notifyByEmail = async (userId, message, notification_type, grievanceId, district) => {
  try {
    const user = await User.findById(userId).select("email name");
    if (!user?.email) return;

    await sendEmailNotification({
      toEmail: user.email,
      toName: user.name,
      message,
      notification_type,
      grievanceId: grievanceId?.toString(),
      district,
    });
  } catch (err) {
    console.error("[notify] Email dispatch failed:", err.message);
  }
};


// GET /api/notification 
export const getUserNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate("grievanceId", "status district");

  return res.status(200).json(new ApiResponse(200, notifications));
});


// PUT /api/notification/:id/read 
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


// PUT /api/notification/read-all
export const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { userId: req.user._id, status: "unread" },
    { $set: { status: "read" } }
  );

  return res.status(200).json(new ApiResponse(200, {}, "All notifications marked as read"));
});


// POST /api/notification/send
export const sendNotification = asyncHandler(async (req, res) => {
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

  // Send email 
  notifyByEmail(userId, message, notification_type, grievanceId, null);

  return res.status(201).json(new ApiResponse(201, notification, "Notification sent"));
});