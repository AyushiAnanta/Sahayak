import { Router } from "express";
import { getUserNotifications, markAsRead, sendNotification } from "../controllers/notification.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.get("/",           getUserNotifications);
router.put("/:id/read",   markAsRead);
router.post("/send",      authorizeRoles("admin"), sendNotification);

export default router;