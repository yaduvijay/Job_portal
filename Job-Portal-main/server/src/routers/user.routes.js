import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  deleteUserById,
  getAllUsersAdmin,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multerConfig.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const userRouter = Router();

userRouter.post("/register", registerUser); // ✅ ⚡
userRouter.post("/login", loginUser); // ✅ ⚡
userRouter.post("/logout", authenticateToken, logoutUser); // ✅ ⚡

userRouter.get("/profile", authenticateToken, getUserProfile); // ✅ ⚡
userRouter.patch(
  "/profile/update",
  authenticateToken,
  upload.fields([
    { name: "avatar", maxCount: 1 }, // Profile image
    { name: "resume", maxCount: 1 }, // Resume file
  ]),
  updateUserProfile
); // ✅ ⚡
userRouter.get("/users", authenticateToken, getAllUsers); // ✅  ⚡
userRouter.delete("/users/:id", authenticateToken, deleteUserById); // ✅ ⚡

userRouter.get("/admin/users", authenticateToken, getAllUsersAdmin);

export default userRouter;

// ✅  Student Test
// ❌  Student Test

// ⚡ Recruiter Test
// ⚠️ Recruiter Test
