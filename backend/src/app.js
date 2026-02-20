import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import authRoutes from "./routes/auth.routes.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import googleRoutes from "./routes/google.routes.js";

const app = express()

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


app.use("/api/auth", authRoutes);
app.use("/api/auth", googleRoutes);

app.use(errorMiddleware);

// http://localhost:8000/api/v1/users/register

export { app }