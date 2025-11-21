import User from "../models/user.js";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { badRequest, unauthorized } from "../utils/ApiError.js";

export const authController = async (req, res) => {
  try {
    const { walletAddress, signature, nonce } = req.body;

    // Fetch nonce from Redis
    const redisNonce = await global.redis.get(`nonce:${walletAddress}`);
    if (!redisNonce) {
      throw badRequest("Nonce expired or invalid.");
    }

    if (redisNonce !== nonce) {
      throw badRequest("Invalid nonce.");
    }


    // Verify SUI signature
    const isValid = true; // for testing


    if (!isValid) {
      throw unauthorized("Invalid signature.");
    }

    // Delete nonce after use to prevent replay
    await global.redis.del(`nonce:${walletAddress}`);
    await global.redis.del(`nonce_ts:${walletAddress}`);

    // Upsert user in MongoDB
    let user = await User.findOne({ walletAddress });
    if (!user) {
      user = new User({ walletAddress });
    }
    user.lastLoginAt = new Date();
    await user.save();

    // Create JWT with new hour-based expiry
    const token = jwt.sign({ userId: user._id }, env.jwtSecret, { expiresIn: `${env.jwtExpiryHours}h` });

    return res.status(200).json({
      success: true,
      message: "Authenticated successfully",
      token,
      user: {
        walletAddress: user.walletAddress,
        heroPoints: user.heroPoints,
        streak: user.streak,
      },
    });
  } catch (err) {
    console.error("Auth error:", err);
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, message: err.message, details: err.details });
    }
    return res.status(500).json({ success: false, message: "Authentication failed." });
  }
};
