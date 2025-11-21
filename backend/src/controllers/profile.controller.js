export const getProfileController = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
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
    return res.status(500).json({ message: "Server error while fetching profile." });
  }
};
