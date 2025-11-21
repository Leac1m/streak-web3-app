import { unauthorized } from "../utils/ApiError.js";

export const getProfileController = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      throw unauthorized();
    }

    return res.status(200).json({
      walletAddress: user.walletAddress,
      heroPoints: user.heroPoints,
      dailyStreak: user.streak?.currentStreak ?? 0,
      lastCheckIn: user.streak?.lastCheckInAt ?? null,
      nextEligibleCheckIn: user.streak?.nextEligibleAt ?? null,
      createdAt: user.meta?.createdAt ?? user.createdAt,
      lastLoginAt: user.meta?.lastLoginAt ?? null,
    });
  } catch (err) {
    console.error("Profile error:", err);
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, message: err.message, details: err.details });
    }
    return res.status(500).json({ success: false, message: "Server error while fetching profile." });
  }
};
