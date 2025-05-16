import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export const authenticateToken = (req, res, next) => {
  try {
    const token =
      req.cookies?.token || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res
        .status(401)
        .json({ message: "Access denied. No token provided." });
    }

    // Verify JWT token
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          return res
            .status(401)
            .json({ message: "Token expired. Please log in again." });
        }
        return res.status(403).json({ message: "Invalid token." });
      }

      req.user = decoded;
      next();
    });
  } catch (error) {
    console.error("Authentication Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
