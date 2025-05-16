import mongoose, { Schema } from "mongoose";

const jobSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      maxlength: 1000,
      trim: true,
    },
    requirements: {
      type: [String],
      default: [],
    },
    salary: {
      type: Number,
      required: true,
      min: 0,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    jobType: {
      type: String,
      required: true,
      enum: ["full-time", "part-time", "internship"],
      default: "full-time",
    },
    position: {
      type: String,
      required: true,
      trim: true,
    },
    experience: {
      type: String,
      require: true,
      min: 0,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    applications: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Application",
      },
    ],
  },
  { timestamps: true }
);

const Job = mongoose.model("Job", jobSchema);
export default Job;
