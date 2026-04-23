import { Router } from "express";
import {
  createGrievance,
  getUserGrievances,
  getGrievanceById,
  editGrievance,
  deleteGrievance,
  getGrievanceStatus,
  uploadGrievanceFile,
} from "../controllers/grievance.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.use(verifyJWT); 

router.post("/create",          createGrievance);
router.get("/all",              getUserGrievances);
router.get("/:id",              getGrievanceById);
router.put("/:id/edit",         editGrievance);
router.delete("/:id",           deleteGrievance);
router.get("/:id/status",       getGrievanceStatus);
router.post("/upload",          upload.single("file"), uploadGrievanceFile);

export default router;