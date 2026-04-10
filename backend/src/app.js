import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes         from "./routes/auth.routes.js";
import googleRoutes       from "./routes/google.routes.js";
import grievanceRoutes    from "./routes/grievance.routes.js";
import feedbackRoutes     from "./routes/feedback.routes.js";
import commentRoutes      from "./routes/comment.routes.js";
import departmentRoutes   from "./routes/department.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import statusLogRoutes    from "./routes/statusLog.routes.js";
import aiLogRoutes        from "./routes/aiProcessingLog.routes.js";
import aiRoutes           from "./routes/ai.routes.js";
import adminRoutes        from "./routes/admin.routes.js";
import officerRoutes      from "./routes/officer.routes.js";
import miscRoutes         from "./routes/misc.routes.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth",         authRoutes);
app.use("/api/google",       googleRoutes);
app.use("/api/grievance",    grievanceRoutes);
app.use("/api/feedback",     feedbackRoutes);
app.use("/api/comment",      commentRoutes);
app.use("/api/department",   departmentRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/status-log",   statusLogRoutes);
app.use("/api/ai-log",       aiLogRoutes);
app.use("/api/ai",           aiRoutes);
app.use("/api/admin",        adminRoutes);
app.use("/api/officer",      officerRoutes);
app.use("/api",              miscRoutes);   // /health /location /languages

// ── Error handler — must always be last ──────────────────────────────────────
app.use(errorMiddleware);

app.get("/debug", (req, res) => {
  res.send({ callbackURL: process.env.GOOGLE_CALLBACK_URL });
});

export { app };