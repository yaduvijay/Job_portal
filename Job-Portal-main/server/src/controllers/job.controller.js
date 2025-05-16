import Job from "../models/jobModel.js";
import Company from "../models/companyModel.js";
import mongoose from "mongoose";

// Create a new job
export const createJob = async (req, res) => {
  const {
    title,
    description,
    requirements,
    salary,
    location,
    jobType,
    experience,
    position,
    companyId,
  } = req.body;

  const userId = req.user?.id;
  const role = req.user?.role;

  // Only recruiters can post jobs
  if (role !== "recruiter") {
    return res
      .status(403)
      .json({ message: "Unauthorized, Only recruiter can post jobs" });
  }

  // Validate required fields
  if (
    !title ||
    !description ||
    !requirements ||
    !salary ||
    !location ||
    !jobType ||
    !experience ||
    !position ||
    !companyId
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Validate salary (must be greater than 0)
  if (salary <= 0) {
    return res
      .status(400)
      .json({ message: "Salary must be a positive number" });
  }

  // Validate jobType and set default
  const validJobTypes = ["full-time", "part-time", "internship"];
  if (!validJobTypes.includes(jobType)) {
    return res.status(400).json({ message: "Invalid job type" });
  }

  try {
    const companyExists = await Company.findById({
      _id: companyId,
      userId: userId,
    });

    if (!companyExists) {
      return res
        .status(404)
        .json({ message: "Company not found or Unauthorized" });
    }

    // Create and save new job
    const newJob = new Job({
      title,
      description,
      requirements,
      salary,
      location,
      jobType,
      experience,
      position,
      company: companyId,
      createdBy: userId,
    });

    await newJob.save();

    return res
      .status(201)
      .json({ message: "Job posted successfully", job: newJob });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

// Get all jobs with filtering, pagination
export const getAllJobs = async (req, res) => {
  const {
    keyword = "",
    page = 1,
    limit = 10,
    minSalary,
    maxSalary,
  } = req.query;
  try {
    const query = {
      $or: [
        { title: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
        { jobType: { $regex: keyword, $options: "i" } },
        { location: { $regex: keyword, $options: "i" } },
      ],
    };

    if (minSalary || maxSalary) {
      query.salary = {};
      if (minSalary) query.salary.$gte = Number(minSalary);
      if (maxSalary) query.salary.$lte = Number(maxSalary);
    }

    const skip = (page - 1) * limit;

    const jobs = await Job.find(query)
      .populate({
        path: "company",
        select: "name description",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .select("-createdBy -applications -updatedAt -__v");

    const totalJobs = await Job.countDocuments(query);

    return res.json({
      message: "Jobs fetched successfully",
      total: totalJobs,
      jobs,
      totalPages: Math.ceil(totalJobs / limit),
      currentPage: Number(page),
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Server Error" });
  }
};

// Get job by ID
export const getJobById = async (req, res) => {
  const { id } = req.params;
  try {
    const job = await Job.findById(id)
      .populate({
        path: "company",
        select: "name description",
      })
      .select("-createdBy -applications -updatedAt -__v");

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    return res.status(200).json({ message: "Job retrieved successfully", job });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Server Error" });
  }
};

// Get job by ID (for recruiter only)
export const getMyJobById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const role = req.user?.role;

  if (role !== "recruiter") {
    return res.status(403).json({
      message: "Unauthorized",
    });
  }

  try {
    const job = await Job.findOne({ _id: id, createdBy: userId }).populate(
      "company"
    );

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    return res.status(200).json({ message: "Job retrieved successfully", job });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Server Error" });
  }
};

// Get all jobs for the recruiter
export const getMyJobs = async (req, res) => {
  const {
    keyword = "",
    minSalary,
    maxSalary,
    page = 1,
    limit = 10,
  } = req.query;

  const userId = req.user?.id;
  const role = req.user?.role;

  if (role !== "recruiter") {
    return res.status(403).json({
      message: "Unauthorized",
    });
  }

  const query = {
    createdBy: userId,
    $or: [
      { title: { $regex: keyword, $options: "i" } },
      { description: { $regex: keyword, $options: "i" } },
      { jobType: { $regex: keyword, $options: "i" } },
      { location: { $regex: keyword, $options: "i" } },
    ],
  };

  if (minSalary || maxSalary) {
    query.salary = {};
    if (minSalary) query.salary.$gte = Number(minSalary);
    if (maxSalary) query.salary.$lte = Number(maxSalary);
  }

  const skip = (page - 1) * limit;

  try {
    const jobs = await Job.find(query)
      .populate("company")
      .skip(skip)
      .limit(Number(limit));

    if (jobs.length === 0) {
      return res.status(404).json({ message: "No jobs found" });
    }

    return res.status(200).json({
      message: "Jobs retrieved successfully",
      total: jobs.length,
      jobs,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Server Error" });
  }
};

// Update job by ID
export const updateJobById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const role = req.user?.role;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid job ID" });
  }

  if (role !== "recruiter") {
    return res
      .status(403)
      .json({ message: "Only recruiters can update there job" });
  }

  try {
    const job = await Job.findOneAndUpdate(
      { _id: id, createdBy: userId },
      req.body,
      { new: true }
    );

    if (!job) {
      return res.status(404).json({ message: "Job not found or unauthorized" });
    }

    return res.status(200).json({ message: "Job updated", job });
  } catch (error) {
    return res.status(500).json({ message: "Server Error" });
  }
};

// Delete job by ID
export const deleteJobById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const role = req.user?.role;

  if (role !== "recruiter") {
    return res.status(403).json({
      message: "Unauthorized, Only Recruiter can delete their jobs",
    });
  }

  try {
    const job = await Job.findOneAndDelete({ _id: id, createdBy: userId });

    if (!job) {
      return res.status(404).json({
        message: "Job not found or you are not authorized to delete it",
      });
    }

    return res.status(200).json({ message: "Job deleted successfully" });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Server Error" });
  }
};
