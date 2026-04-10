import { Router } from "express";
import {
  addComment,
  getComments,
  deleteComment,
  getCommentById,
} from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.post("/:grievanceId",          addComment);
router.get("/:grievanceId",           getComments);
router.delete("/:commentId",          deleteComment);
router.get("/single/:commentId",      getCommentById);

export default router;