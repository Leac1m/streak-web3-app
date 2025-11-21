import jwt from "jsonwebtoken";
import User from "../models/user.js";
import { unauthorized } from "../utils/ApiError.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      throw unauthorized("Missing or invalid authorization header.");
    }

    const token = header.split(" ")[1];

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      throw unauthorized("Invalid or expired token.");
    }

    // Fetch user and attach to req
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw unauthorized("User not found.");
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("JWT middleware error:", err);
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, message: err.message, details: err.details });
    }
    return res.status(500).json({ success: false, message: "Internal authentication error." });
  }
};
