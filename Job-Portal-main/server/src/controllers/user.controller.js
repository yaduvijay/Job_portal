import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import { fileValidation } from "../utils/fileValidation.js";
import S3Service from "../services/imageService.service.js";
import { extractFilename } from "../utils/extractFilename.js";
import { transformImageUrl } from "../utils/transformImageUrl.js";

export const registerUser = async (req, res) => {
  const {
    fullName,
    email,
    password,
    phoneNumber,
    role = "student",
    gender,
  } = req.body;

  if (!fullName || !email || !password || !role || !phoneNumber || !gender) {
    return res
      .status(400)
      .json({ message: "Please fill all the required fields" });
  }

  const avatar =
    gender === "male"
      ? "https://api.dicebear.com/9.x/adventurer/svg?seed=Aneka"
      : "https://api.dicebear.com/9.x/adventurer/svg?seed=Felix";

  try {
    const newUser = await User({
      fullName,
      email,
      password,
      phoneNumber,
      role,
      gender,
      profile: {
        profilePhoto: avatar,
      },
    });

    await newUser.save();

    return res.status(201).json({
      message: "User saved successfully",
      user: newUser,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Email already exists" });
    }
    return res.status(500).json({ message: "yha se h " + error.message });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Please provide email and password" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const JWT_SECRET = process.env.JWT_SECRET;

    const payLoad = {
      id: user._id,
      email: user.email,
      role: user.role,
      phoneNumber: user.phoneNumber,
      profile: user.profile,
    };

    const token = jwt.sign(payLoad, JWT_SECRET, {
      expiresIn: "1h",
    });

    const option = {
      httpOnly: true,
      secure: true,
      maxAge: 1 * 24 * 60 * 60 * 1000, // 1Day
      sameSite: "Strict",
    };

    return res.status(200).cookie("token", token, option).json({
      message: "User Login Successfully",
      token: token,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const logoutUser = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "User not logged in" });
  }
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
    maxAge: 0,
  });

  return res.status(200).json({ message: "User logged out successfully" });
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user?.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ user });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const updateUserProfile = async (req, res) => {
  const { fullName, email, phoneNumber, bio, skills, gender } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update only provided fields (PATCH request behavior)
    if (fullName) existingUser.fullName = fullName;
    if (email) existingUser.email = email;
    if (phoneNumber) existingUser.phoneNumber = phoneNumber;
    if (bio) existingUser.profile.bio = bio;
    if (gender) {
      existingUser.gender = gender;
    }
    if (skills) {
      if (Array.isArray(skills)) {
        existingUser.profile.skill = skills.map((skill) => skill.trim());
      } else if (typeof skills === "string") {
        existingUser.profile.skill = skills
          .split(",")
          .map((skill) => skill.trim());
      } else {
        return res.status(400).json({ message: "Invalid skills format" });
      }
    }

    // Update profile photo if provided
    if (req.files?.avatar) {
      fileValidation(req);
      try {
        if (existingUser.profile.profilePhoto) {
          const filename = extractFilename(existingUser.profile.profilePhoto);
          const isDeleted = await S3Service.deleteImageFromS3(filename);
          if (!isDeleted) {
            return res
              .status(500)
              .json({ message: "Failed to delete old image" });
          }
        }

        let imageUrl = await S3Service.uploadToS3(req.files.avatar[0]);
        if (!imageUrl)
          return res.status(500).json({ message: "Upload failed" });

        imageUrl = transformImageUrl(imageUrl);
        existingUser.profile.profilePhoto = imageUrl;
      } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: "Error uploading to S3" });
      }
    }

    if (req.role === "student" && req.files?.resume) {
      fileValidation(req);
      try {
        if (existingUser.profile.resume) {
          const filename = extractFilename(existingUser.profile.resume);
          const isDeleted = await S3Service.deleteResuneFromS3(filename);
          if (!isDeleted) {
            return res
              .status(500)
              .json({ message: "Failed to delete old Resume" });
          }
        }

        let resumeUrl = await S3Service.uploadResumeS3(req.files.resume[0]);
        if (!resumeUrl)
          return res.status(500).json({ message: "Upload failed" });

        // resumeUrl = transformImageUrl(resumeUrl);
        existingUser.profile.resume = resumeUrl;
      } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: "Error uploading to S3" });
      }
    }

    await existingUser.save();

    return res.status(200).json({
      message: "User profile updated successfully",
      user: existingUser, // Return updated user data
    });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const getAllUsers = async (req, res) => {
  const role = req.user?.role;

  if (role !== "recruiter") {
    return res
      .status(403)
      .json({ message: "Unauthorized,Only Recruiter Can access this Route" });
  }
  try {
    const users = await User.find({ role: "student" }).select("-password");
    return res.status(200).json({
      total: users.length,
      users,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const deleteUserById = async (req, res) => {
  const userId = req.params.id;
  const myId = req.user?.id;
  const role = req.user?.role;

  if (role !== "recruiter") {
    return res.status(403).json({ message: "Unauthorized" });
  }

  if (userId === myId) {
    return res.status(403).json({ message: "Cannot delete yourself" });
  }

  try {
    const userToDelete = await User.findOneAndDelete({
      _id: userId,
      role: "student",
    });

    if (!userToDelete) {
      return res
        .status(404)
        .json({ message: "User not found or not a student" });
    }

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const getAllUsersAdmin = async (req, res) => {
  const role = req.user?.role;

  if (role !== "admin") {
    return res
      .status(403)
      .json({ message: "Unauthorized, Only Admin can access this route" });
  }

  const { page = 1, limit = 10 } = req.query; // Allow pagination via query params
  const skip = (page - 1) * limit; // Calculate the number of users to skip

  try {
    // Fetch all users excluding the admin user (exclude by role or by admin's userId)
    const users = await User.find({ role: { $ne: "admin" } }) // Excluding admin users
      .select("-password")
      .skip(skip)
      .limit(Number(limit)); // Ensure limit is a number

    const totalUsers = await User.countDocuments({ role: { $ne: "admin" } }); // Get total number of non-admin users

    return res.status(200).json({
      total: totalUsers,
      users,
      page,
      totalPages: Math.ceil(totalUsers / limit), // Calculate total pages
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Server Error" });
  }
};
