import User from "../models/user.js";
import TonWeb from "tonweb";
import jwt from "jsonwebtoken";

const tonweb = new TonWeb();
const nacl = TonWeb.utils.nacl;

export const authController = async (req, res) => {
  try {
    const { walletAddress, signature, nonce } = req.body;

    if (!walletAddress || !signature || !nonce) {
      return res.status(400).json({ success: false, message: "walletAddress, signature, nonce required." });
    }

    // Fetch nonce from Redis
    const redisNonce = await global.redis.get(`nonce:${walletAddress}`);
    if (!redisNonce) {
      return res.status(400).json({ success: false, message: "Nonce expired or invalid." });
    }

    if (redisNonce !== nonce) {
      return res.status(400).json({ success: false, message: "Invalid nonce." });
    }


    // Verify TON signature
    const isValid = false; // for testing

    // const isValid = nacl.sign.detached.verify(
    //   Buffer.from(nonce),
    //   TonWeb.utils.base64ToBytes(signature),
    //   TonWeb.utils.base64ToBytes(walletAddress)
    // );

    if (!isValid) {
      return res.status(401).json({ success: false, message: "Invalid signature." });
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

    // Create JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

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
    return res.status(500).json({ success: false, message: "Authentication failed." });
  }
};
