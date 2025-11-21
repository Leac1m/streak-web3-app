import User from "../models/user.js";
import TonWeb from "tonweb";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { badRequest, unauthorized, internal } from "../utils/ApiError.js";

const tonweb = new TonWeb();
const nacl = TonWeb.utils.nacl;

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


    // Verify TON signature
    // const isValid = true; // for testing

    const isValid = nacl.sign.detached.verify(
      Buffer.from(nonce),
      TonWeb.utils.base64ToBytes(signature),
      TonWeb.utils.base64ToBytes(walletAddress)
    );

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
