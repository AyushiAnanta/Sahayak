import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


// POST /api/comment/:grievanceId — adds a new comment to a grievance thread
export const addComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  if (!content) throw new ApiError(400, "Content is required");

  const comment = await Comment.create({
    content,
    grievance_id: req.params.grievanceId,   // model field is grievance_id
    userId: req.user._id,
    is_deleted: false,
  });

  return res.status(201).json(new ApiResponse(201, comment, "Comment added"));
});


// GET /api/comment/:grievanceId — fetches all non-deleted comments for a grievance
export const getComments = asyncHandler(async (req, res) => {
  const comments = await Comment.find({
    grievance_id: req.params.grievanceId,
    is_deleted: false,
  })
    .sort({ createdAt: 1 })
    .populate("userId", "name username role");

  return res.status(200).json(new ApiResponse(200, comments));
});


// DELETE /api/comment/:commentId — soft deletes a comment by setting is_deleted = true
export const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findOne({
    _id: req.params.commentId,
    userId: req.user._id,
    is_deleted: false,
  });

  if (!comment) throw new ApiError(404, "Comment not found");

  comment.is_deleted = true;
  await comment.save();

  return res.status(200).json(new ApiResponse(200, {}, "Comment deleted"));
});


// GET /api/comment/single/:commentId — fetches a single comment by its id
export const getCommentById = asyncHandler(async (req, res) => {
  const comment = await Comment.findOne({
    _id: req.params.commentId,
    is_deleted: false,
  }).populate("userId", "name username");

  if (!comment) throw new ApiError(404, "Comment not found");

  return res.status(200).json(new ApiResponse(200, comment));
});