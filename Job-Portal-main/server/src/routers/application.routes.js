import { Router } from "express";
import {
  applyForJob,
  getAllApplicationsByUser,
  getMyApplicantsById,
  updateApplicationStatus,
  getAllApplications,
} from "../controllers/application.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const applicationRouter = Router();

applicationRouter.get("/apply/:id", authenticateToken, applyForJob); // ✅
applicationRouter.get("/my-applications",authenticateToken,getAllApplicationsByUser); // ✅

applicationRouter.get("/my/applications", authenticateToken, getAllApplications);  // ⚡
applicationRouter.get("/my/applications/:id",authenticateToken,getMyApplicantsById); // ⚡
applicationRouter.patch("/update-status/:id",authenticateToken,updateApplicationStatus); // ⚡


export default applicationRouter;


