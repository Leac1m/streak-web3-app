import User from "../models/user.js";

export const getLeaderboardController = async (req, res) => {
  try {
    // Optional future use when JWT is added:

    const limit = parseInt(req.query.limit) || 20; // default top 20

    const users = await User.find({})
      .sort({ heroPoints: -1 })  // highest scoring first
      .limit(limit)
      .lean();

    // Attach rank number
    const leaderboard = users.map((user, index) => ({
      walletAddress: user.walletAddress,
      heroPoints: user.heroPoints,
      rank: index + 1
    }));

    return res.status(200).json({
      success: true,
      leaderboard
    });

  } catch (err) {
    console.error("Leaderboard error:", err);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching leaderboard."
    });
  }
};
