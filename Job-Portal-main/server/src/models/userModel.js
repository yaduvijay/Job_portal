import mongoose, { Schema } from "mongoose";
import emailValidator from "email-validator";
import bcrypt from "bcryptjs";

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ["male", "female"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      validate: {
        validator: (email) => emailValidator.validate(email),
        message: "Invalid email format",
      },
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["student", "recruiter", "admin"],
      default: "student",
    },
    profile: {
      bio: { type: String, trim: true },
      skill: { type: [String], default: [] },
      resume: { type: String },
      resumeOriginalName: { type: String },
      companies: { type: Schema.Types.ObjectId, ref: "Company" },
      profilePhoto: { type: String, default: "" },
    },
  },
  {
    timestamps: true,
  }
);

// Pre Hook to Hask the user Password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare Password
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
