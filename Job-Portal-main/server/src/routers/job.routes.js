import { Router } from "express";
import {
  createJob,
  getAllJobs,
  getJobById,
  updateJobById,
  deleteJobById,
  getMyJobs,
  getMyJobById,
} from "../controllers/job.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const jobRouter = Router();
jobRouter.get("/jobs", getAllJobs); // 🌍
jobRouter.get("/jobs/:id", getJobById); // 🌍

jobRouter.post("/jobs/add", authenticateToken, createJob); // ⚡
jobRouter.patch("/jobs/:id", authenticateToken, updateJobById); // ⚡
jobRouter.delete("/jobs/:id", authenticateToken, deleteJobById); // ⚡
jobRouter.get("/my/jobs", authenticateToken, getMyJobs); // ⚡
jobRouter.get("/my/jobs/:id", authenticateToken, getMyJobById); // ⚡

export default jobRouter;

// ✅  Student Test
// ❌  Student Test

// ⚡ Recruiter Test
// ⚠️ Recruiter Test

// 🌍 Public Test
