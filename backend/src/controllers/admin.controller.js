import { Grievance } from "../models/grievance.model.js";
import { Notification } from "../models/notification.model.js";
import { StatusLog } from "../models/statusLog.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


// GET /api/admin/grievances — returns all grievances in the system with optional filters
export const getAllGrievances = asyncHandler(async (req, res) => {
  const { status, category, district, page = 1, limit = 20 } = req.query;

  const filter = { is_deleted: false };
  if (status) filter.status = status;
  if (category) filter.category = category;
  if (district) filter.district = district;

  const grievances = await Grievance.find(filter)
    .sort({ priorityScore: -1, createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .populate("userId", "name username email")
    .populate("departmentId", "name")
    .populate("assignedOfficerId", "name username");

  const total = await Grievance.countDocuments(filter);

  return res.status(200).json(new ApiResponse(200, { grievances, total, page: Number(page) }));
});


// GET /api/admin/grievances/pending — returns all grievances with status pending or in_progress
export const getPendingGrievances = asyncHandler(async (req, res) => {
  const grievances = await Grievance.find({
    status: { $in: ["pending", "in_progress"] },
    is_deleted: false,
  })
    .sort({ priorityScore: -1, createdAt: 1 })
    .populate("userId", "name username email")
    .populate("departmentId", "name");

  return res.status(200).json(new ApiResponse(200, { grievances, total: grievances.length }));
});


// PUT /api/admin/assign/:id — assigns a grievance to a department and/or officer, moves status to in_progress
export const assignGrievance = asyncHandler(async (req, res) => {
  const { departmentId, officerId } = req.body;
  if (!departmentId) throw new ApiError(400, "departmentId is required");

  const grievance = await Grievance.findOne({ _id: req.params.id, is_deleted: false });
  if (!grievance) throw new ApiError(404, "Grievance not found");

  const oldStatus = grievance.status;

  grievance.departmentId = departmentId;
  if (officerId) grievance.assignedOfficerId = officerId;
  if (grievance.status === "pending") grievance.status = "in_progress";

  await grievance.save();

  // Log the status change
  await StatusLog.create({
    grievanceId: grievance._id,
    userId: grievance.userId,
    changedByUserId: req.user._id,
    oldStatus,
    newStatus: grievance.status,
    remark: `Assigned to department ${departmentId}${officerId ? `, officer ${officerId}` : ""}`,
  });

  // Notify the user
  await Notification.create({
    userId: grievance.userId,
    grievanceId: grievance._id,
    message: "Your grievance has been assigned and is now under process.",
    notification_type: "Under Process",
    status: "unread",
  });

  return res.status(200).json(new ApiResponse(200, grievance, "Grievance assigned"));
});


// PUT /api/admin/status/:id — force-updates the status of any grievance and logs the change
export const updateGrievanceStatus = asyncHandler(async (req, res) => {
  const { status, remark } = req.body;
  const validStatuses = ["pending", "in_progress", "resolved", "rejected"];

  if (!status || !validStatuses.includes(status)) {
    throw new ApiError(400, `status must be one of: ${validStatuses.join(", ")}`);
  }

  const grievance = await Grievance.findOne({ _id: req.params.id, is_deleted: false });
  if (!grievance) throw new ApiError(404, "Grievance not found");

  const oldStatus = grievance.status;
  grievance.status = status;
  await grievance.save();

  // Log the status change for audit trail
  await StatusLog.create({
    grievanceId: grievance._id,
    userId: grievance.userId,
    changedByUserId: req.user._id,
    oldStatus,
    newStatus: status,
    remark: remark || "",
  });

  // Map status to notification_type enum
  const typeMap = {
    in_progress: "Under Process",
    resolved: "Completed",
    rejected: "Dropped",
    pending: "Update",
  };

  await Notification.create({
    userId: grievance.userId,
    grievanceId: grievance._id,
    message: `Your grievance status has been updated to: ${status}`,
    notification_type: typeMap[status],
    status: "unread",
  });

  return res.status(200).json(new ApiResponse(200, grievance, "Status updated"));
});


// GET /api/admin/stats/monthly — returns monthly complaint counts, category breakdown, and status distribution
export const getMonthlyStats = asyncHandler(async (req, res) => {
  const monthly = await Grievance.aggregate([
    { $match: { is_deleted: false } },
    {
      $group: {
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        total: { $sum: 1 },
        resolved: { $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] } },
        avgPriority: { $avg: "$priorityScore" },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  const categoryBreakdown = await Grievance.aggregate([
    { $match: { is_deleted: false } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  const statusDistribution = await Grievance.aggregate([
    { $match: { is_deleted: false } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  return res.status(200).json(new ApiResponse(200, { monthly, categoryBreakdown, statusDistribution }));
});


// GET /api/admin/notifications — fetches all notifications in the system (admin view)
export const getAdminNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find()
    .sort({ createdAt: -1 })
    .limit(100)
    .populate("userId", "name username")
    .populate("grievanceId", "status district category");

  return res.status(200).json(new ApiResponse(200, notifications));
});

// GET /api/admin/stats/users — returns total users and officers count
export const getUserStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalOfficers] = await Promise.all([
    User.countDocuments({ role: "user", }),
    User.countDocuments({ role: "officer" }),
  ]);

  return res.status(200).json(new ApiResponse(200, {
    totalUsers,
    totalOfficers,
    total: totalUsers + totalOfficers,
  }));
});