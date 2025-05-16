import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/database.js";
import userRouter from "./routers/user.routes.js";
import companyRouter from "./routers/company.routes.js";
import jobRouter from "./routers/job.routes.js";
import applicationRouter from "./routers/application.routes.js";

dotenv.config();

const corsOptions = {
  origin: "*",
  credentials: true,
};

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));
app.use("/api/auth/", userRouter);
app.use("/api/company/", companyRouter);
app.use("/api/job", jobRouter);
app.use("/api/applications", applicationRouter);

connectDB();

app.get("/", (_, res) => {
  res.status(200).json({ message: "API running....." });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.warn(`🚀 Server is running on port http://localhost:${PORT} 🚀`);
});
