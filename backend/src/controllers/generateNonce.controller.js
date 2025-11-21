import { v4 as uuidv4 } from "uuid";
import User from "../models/user.js";
import { internal } from "../utils/ApiError.js";

export const generateNonceController = async (req, res) => {
  try {
    const { walletAddress } = req.body; // validated already

    // Create or find the user
    let user = await User.findOne({ walletAddress });
    if (!user) {
      user = new User({ walletAddress });
      await user.save();
    }

    // Generate a nonce
    const nonce = uuidv4();
    const now = Date.now();

    // Store nonce + timestamp in Redis with TTL 5 minutes
    await global.redis.set(`nonce:${walletAddress}`, nonce, { EX: 300 });
    await global.redis.set(`nonce_ts:${walletAddress}`, now, { EX: 300 });

    return res.status(200).json({ success: true, nonce });
  } catch (err) {
    console.error("Nonce generation error:", err);
    return res.status(500).json({ success: false, message: "Failed to generate nonce." });
  }
};
