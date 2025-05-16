import mongoose, { Schema } from "mongoose";

const companySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          return /^https?:\/\/[^\s$.?#].[^\s]*$/.test(v);
        },
        message: "Invalid URL format",
      },
    },
    location: {
      type: String,
      trim: true,
    },
    logo: {
      type: String,
      trim: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Company = mongoose.model("Company", companySchema);
export default Company;
