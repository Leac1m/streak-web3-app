import User from "../models/user.js";

export const getProfileController = async (req, res) => {
  try {
    // TEMPORARY: will replace with JWT later
    const userId = req.body.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Missing userId. JWT auth will handle this later.",
      });
    }

    const user = await User.findById(userId).lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        walletAddress: user.walletAddress,
        heroPoints: user.heroPoints,

        streak: {
          currentStreak: user.streak.currentStreak,
          lastCheckInAt: user.streak.lastCheckInAt,
          nextEligibleAt: user.streak.nextEligibleAt,
        },

        meta: {
          createdAt: user.meta.createdAt,
          lastLoginAt: user.meta.lastLoginAt,
        },
      },
    });
  } catch (err) {
    console.error("Profile error:", err);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching profile.",
    });
  }
};
