import { Grievance } from "../models/grievance.model.js";
import { Notification } from "../models/notification.model.js";
import { StatusLog } from "../models/statusLog.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendEmailNotification } from "../utils/email.js";

// GET /api/officer/tasks
export const getAssignedTasks = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;

  const filter = { assignedOfficerId: req.user._id, is_deleted: false };
  if (status) filter.status = status;

  const tasks = await Grievance.find(filter)
    .sort({ priorityScore: -1, createdAt: 1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .populate("userId", "name username email phoneNo")
    .populate("departmentId", "name");

  const total = await Grievance.countDocuments(filter);

  return res.status(200).json(new ApiResponse(200, { tasks, total, page: Number(page) }));
});


// PUT /api/officer/tasks/:id/progress 
export const updateTaskProgress = asyncHandler(async (req, res) => {
  const { remark } = req.body;

  const grievance = await Grievance.findOne({
    _id: req.params.id,
    assignedOfficerId: req.user._id,
    is_deleted: false,
  });

  if (!grievance) throw new ApiError(404, "Task not found or not assigned to you");

  const oldStatus = grievance.status;
  grievance.status = "in_progress";
  await grievance.save();

  await StatusLog.create({
    grievanceId: grievance._id,
    userId: grievance.userId,
    changedByUserId: req.user._id,
    oldStatus,
    newStatus: "in_progress",
    remark: remark || "Officer started working on the grievance",
  });

  await Notification.create({
    userId: grievance.userId,
    grievanceId: grievance._id,
    message: "Your grievance is currently being worked on by an officer.",
    notification_type: "Under Process",
    status: "unread",
  });

  const citizenProgress = await User.findById(grievance.userId).select("email name");
  if (citizenProgress?.email) {
    await sendEmailNotification({
      toEmail: citizenProgress.email,
      toName:  citizenProgress.name,
      message: "Your grievance is currently being worked on by an officer.",
      notification_type: "Under Process",
      grievanceId: grievance._id.toString(),
      district: grievance.district,
    });
  }

  return res.status(200).json(new ApiResponse(200, grievance, "Progress updated"));
});


// PUT /api/officer/tasks/:id/complete 
export const completeTask = asyncHandler(async (req, res) => {
  const { remark } = req.body;

  const grievance = await Grievance.findOne({
    _id: req.params.id,
    assignedOfficerId: req.user._id,
    is_deleted: false,
  });

  if (!grievance) throw new ApiError(404, "Task not found or not assigned to you");

  const oldStatus = grievance.status;
  grievance.status = "resolved";
  await grievance.save();

  await StatusLog.create({
    grievanceId: grievance._id,
    userId: grievance.userId,
    changedByUserId: req.user._id,
    oldStatus,
    newStatus: "resolved",
    remark: remark || "Resolved by officer",
  });

  await Notification.create({
    userId: grievance.userId,
    grievanceId: grievance._id,
    message: "Your grievance has been resolved. Please submit your feedback.",
    notification_type: "Completed",
    status: "unread",
  });

  const citizenComplete = await User.findById(grievance.userId).select("email name");
  if (citizenComplete?.email) {
    await sendEmailNotification({
      toEmail: citizenComplete.email,
      toName:  citizenComplete.name,
      message: "Your grievance has been resolved. Please submit your feedback.",
      notification_type: "Completed",
      grievanceId: grievance._id.toString(),
      district: grievance.district,
    });
  }

  return res.status(200).json(new ApiResponse(200, grievance, "Task marked as resolved"));
});

export const getOfficersByDepartment = asyncHandler(async (req, res) => {
  const officers = await User.find({
    departmentId: req.params.deptId,
    role: "officer",
  }).select("name username email");
 
  return res.status(200).json(new ApiResponse(200, officers));
});
 