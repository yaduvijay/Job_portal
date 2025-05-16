import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { s3, BUCKET_NAME, REGION } from "../config/s3Config.js";

class S3Service {
  constructor() {
    this.bucketName = BUCKET_NAME;
    this.region = REGION;
  }

  // Helper method to convert image URLs
  convertImageUrl(url, sourceFolder, targetFolder) {
    if (!url.includes(`/${sourceFolder}/`)) {
      return false;
    }
    let optimizedUrl = url.replace(`/${sourceFolder}/`, `/${targetFolder}/`);
    return optimizedUrl;
  }

  // Upload image to S3 (Raw-images folder)
  async uploadToS3(file) {
    try {
      const fileName = `Raw-images/${file.originalname}`;
      const uploadParams = {
        Bucket: this.bucketName,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
      };

      await s3.send(new PutObjectCommand(uploadParams));

      const imageUrl = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${fileName}`;
      const optimizedUrl = this.convertImageUrl(
        imageUrl,
        "Raw-images",
        "Optimize-images"
      );

      return optimizedUrl;
    } catch (error) {
      console.error("Error uploading file:", error.message);
      return false;
    }
  }

  // Delete image from S3 (Optimize-images folder)
  async deleteImageFromS3(fileName) {
    try {
      const deleteParams = {
        Bucket: this.bucketName,
        Key: `Optimize-images/${fileName}`,
      };

      await s3.send(new DeleteObjectCommand(deleteParams));
      console.warn(`Deleted file: Optimize-images/${fileName}`);
      return true;
    } catch (error) {
      console.error("Error deleting file:", error);
      return false;
    }
  }

  // Download Resume from S3 (Resume folder)
  async downloadResumeFromS3(fileName) {
    try {
      const getParams = {
        Bucket: this.bucketName,
        Key: `Resume/${fileName}`,
      };

      const command = new GetObjectCommand(getParams);
      const { Body } = await s3.send(command);

      return Body;
    } catch (error) {
      console.error("Error downloading file:", error);
      return null;
    }
  }

  async uploadResumeS3(file) {
    try {
      const fileName = `Resume/${file.originalname}`;
      const uploadParams = {
        Bucket: this.bucketName,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
      };

      await s3.send(new PutObjectCommand(uploadParams));

      const resumeURL = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${fileName}`;
      return resumeURL;
    } catch (error) {
      console.error("Error uploading file:", error.message);
      return false;
    }
  }

  async deleteResuneFromS3(fileName) {
    try {
      const deleteParams = {
        Bucket: this.bucketName,
        Key: `Resume/${fileName}`,
      };

      await s3.send(new DeleteObjectCommand(deleteParams));
      console.warn(`Deleted file: Resume/${fileName}`);
      return true;
    } catch (error) {
      console.error("Error deleting file:", error);
      return false;
    }
  }
}

export default new S3Service();
