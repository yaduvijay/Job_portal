import Application from "../models/applicationModel.js";
import Job from "../models/jobModel.js";
import mongoose from "mongoose";

export const applyForJob = async (req, res) => {
  const userId = req.user?.id;
  const role = req.user?.role;
  const jobId = req.params.id;

  if (role !== "student") {
    return res
      .status(403)
      .json({ message: "Unauthorized, only students can apply to jobs" });
  }

  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    return res.status(400).json({ message: "Invalid job ID" });
  }

  try {
    // Check if the user already applied
    const existingApplication = await Application.findOne({
      applicant: userId,
      job: jobId,
    });
    if (existingApplication) {
      return res
        .status(400)
        .json({ message: "You have already applied to this job" });
    }

    // Check if the job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Check if the job is still open for applications
    if (job.status === "closed") {
      return res
        .status(400)
        .json({ message: "This job is no longer accepting applications" });
    }

    // Create a new application
    const newApplication = await Application.create({
      applicant: userId,
      job: jobId,
    });

    // Update the job's applications array
    await Job.findByIdAndUpdate(jobId, {
      $push: { applications: newApplication._id },
    });

    return res
      .status(201)
      .json({ message: "Application submitted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const getAllApplicationsByUser = async (req, res) => {
  const userId = req.user?.id;
  const role = req.user?.role;

  if (role !== "student") {
    return res
      .status(403)
      .json({ message: "Unauthorized, only students can view applications" });
  }

  try {
    const applications = await Application.find({ applicant: userId })
      .sort({ createdAt: -1 })
      .populate({
        path: "job",
        populate: { path: "company" },
      });

    if (!applications.length) {
      return res.status(404).json({ message: "No applications found" });
    }

    return res
      .status(200)
      .json({ message: "Applications retrieved successfully", applications });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAllApplications = async (req, res) => {
  const role = req.user?.role;
  const userId = req.user?.id;

  if (role !== "recruiter") {
    return res
      .status(403)
      .json({ message: "Unauthorized, only recruiters can view applications" });
  }

  try {
    // Find jobs created by the recruiter
    const jobs = await Job.find({ createdBy: userId });

    if (jobs.length === 0) {
      return res
        .status(404)
        .json({ message: "No jobs found for this recruiter" });
    }

    // Extract job IDs from the jobs found
    const jobIds = jobs.map((job) => job._id);

    const applications = await Application.find({ job: { $in: jobIds } })
      .populate({
        path: "job",
        select: "title location jobType position experience",
        populate: { path: "company", select: "name" },
      })
      .populate({
        path: "applicant",
        select: "fullName gender email phoneNumber profile status",
      });

    if (applications.length === 0) {
      return res
        .status(404)
        .json({ message: "No applications found for your jobs" });
    }

    return res.status(200).json({
      message: "Applications retrieved successfully",
      total: applications.length,
      applications,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Server Error" });
  }
};

// For Recruiters Only
export const getMyApplicantsById = async (req, res) => {
  const jobId = req.params.id;
  const role = req.user?.role;
  const userId = req.user?.id;

  // Ensure the user is a recruiter
  if (role !== "recruiter") {
    return res
      .status(403)
      .json({ message: "Unauthorized, only recruiters can view applicants" });
  }

  // Check if the job ID is valid
  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    return res.status(400).json({ message: "Invalid job ID" });
  }

  try {
    // Find the job created by the recruiter (userId)
    const job = await Job.findOne({ _id: jobId, createdBy: userId }).populate({
      path: "applications",
      select: "-job",
      populate: {
        path: "applicant",
        select: "fullName email phoneNumber status",
      },
    });

    if (!job) {
      return res.status(404).json({ message: "Job not found or unauthorized" });
    }

    // If no applicants
    if (job.applications.length === 0) {
      return res
        .status(404)
        .json({ message: "No applicants found for this job" });
    }

    return res.status(200).json({
      message: "Applicants retrieved successfully",
      total: job.applications.length,
      applicants: job.applications,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const updateApplicationStatus = async (req, res) => {
  const { status } = req.body;
  const applicationId = req.params.id;
  const role = req.user?.role;
  const userId = req.user?.id;

  // Ensure the user is a recruiter
  if (role !== "recruiter") {
    return res.status(403).json({
      message: "Unauthorized, only recruiters can update application status",
    });
  }

  // Validate the status value
  if (!["pending", "accepted", "rejected", "closed"].includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  try {
    // Find the application
    const application = await Application.findById(applicationId).populate(
      "job"
    );

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Ensure the recruiter owns the job the application is for
    const job = application.job;
    if (job.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({
        message:
          "Unauthorized, you can only update applications for your own jobs",
      });
    }

    // Update the status of the application
    application.status = status;
    await application.save();

    return res.status(200).json({
      message: "Application status updated successfully",
      application,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
};
