import mongoose from "mongoose";
import Company from "../models/companyModel.js";
import { fileValidation } from "../utils/fileValidation.js";
import S3Service from "../services/imageService.service.js";
import { extractFilename } from "../utils/extractFilename.js";
import { transformImageUrl } from "../utils/transformImageUrl.js";

export const createCompany = async (req, res) => {
  const { name } = req.body;

  const role = req.user?.role;

  if (role !== "recruiter") {
    return res.status(403).json({
      message: "Unauthorized, Only recruiter can register their company",
    });
  }

  if (!name) {
    return res.status(400).json({ message: "Please provide a company name" });
  }

  try {
    const company = await Company.findOne({ name });
    if (company) {
      return res.status(400).json({ message: "Company already exists" });
    }

    // Company Name with Founder
    const newCompany = new Company({
      name,
      userId: req.user?.id,
    });

    await newCompany.save();

    return res.status(201).json({
      message: "Company registered successfully",
      company: newCompany,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const updateCompanyById = async (req, res) => {
  const { name, description, website, location } = req.body;
  const role = req.user?.role;

  if (role !== "recruiter") {
    return res.status(403).json({
      message: "Unauthorized, Only recruiter can Update their company",
    });
  }

  let updateData = {};
  if (name) updateData.name = name;
  if (description) updateData.description = description;
  if (website) updateData.website = website;
  if (location) updateData.location = location;

  try {
    const company = await Company.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    if (req.files?.logo) {
      fileValidation(req);

      try {
        if (company.logo) {
          const filename = extractFilename(company.logo);
          const isDeleted = await S3Service.deleteResuneFromS3(filename);
          if (!isDeleted) {
            return res
              .status(500)
              .json({ message: "Failed to delete old logo" });
          }
        }

        let logoUrl = await S3Service.uploadToS3(req.files.logo[0]);

        if (!logoUrl) {
          return res.status(500).json({ message: "Upload failed" });
        }

        logoUrl = transformImageUrl(logoUrl);
        company.logo = logoUrl;
        await company.save();
      } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: "Error uploading to S3" });
      }
    }

    return res.status(200).json({
      message: "Company information updated",
      company,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const deleteCompanyById = async (req, res) => {
  const role = req.user?.role;

  if (role !== "recruiter") {
    return res.status(403).json({
      message: "Unauthorized, Only Founder can Delete their company",
    });
  }
  try {
    const company = await Company.findByIdAndDelete(req.params.id);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }
    return res.status(200).json({ message: "Company deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const getAllCompanies = async (req, res) => {
  try {
    const { name, sortBy, sortOrder } = req.query;

    let query = {};
    if (name) {
      query.name = { $regex: name, $options: "i" };
    }

    let sortOptions = {};

    if (sortBy) {
      sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1; // Default to ascending (1), or descending (-1) if "desc"
    } else {
      sortOptions.name = 1;
    }

    const companies = await Company.find(query)
      .sort(sortOptions)
      .select("-userId");

    if (companies.length === 0) {
      return res.status(404).json({ message: "No companies found" });
    }

    return res.status(200).json({
      message: "Companies retrieved successfully",
      total: companies.length,
      companies,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const getCompanyById = async (req, res) => {
  const companyId = req.params.id;

  try {
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }
    return res.status(200).json({
      message: "Company retrieved successfully",
      company,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const getMyCompanies = async (req, res) => {
  const userId = req.user?.id;
  const role = req.user?.role;

  if (!userId || role !== "recruiter") {
    return res.status(403).json({
      message: "Unauthorized, Only recruiters can access their companies",
    });
  }

  try {
    const companies = await Company.find({ userId });

    if (companies.length === 0) {
      return res.status(404).json({ message: "No companies found" });
    }

    return res.status(200).json({
      message: "Companies retrieved successfully",
      total: companies.length,
      companies,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const getMyCompanyById = async (req, res) => {
  const userId = req.user?.id;
  const role = req.user?.role;

  if (!userId || role !== "recruiter") {
    return res.status(403).json({
      message: "Unauthorized, Only recruiters can access their company",
    });
  }

  const companyId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(companyId)) {
    return res.status(400).json({ message: "Invalid or missing Company ID" });
  }

  try {
    const company = await Company.findOne({
      _id: companyId,
      userId,
    });

    if (!company) {
      return res
        .status(404)
        .json({ message: "Company not found or Unauthorized" });
    }

    return res.status(200).json({
      message: "Company retrieved successfully",
      company,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
};
