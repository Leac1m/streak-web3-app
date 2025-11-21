import { processCheckIn } from "../services/checkin.service.js";
import User from "../models/user.js";

export const checkInController = async (req, res) => {
  try {
    // TEMPORARY: Will replace this when JWT is added
    const userId = req.body.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Missing userId. JWT auth will replace this soon.",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const result = await processCheckIn(userId);

    return res.status(200).json({
      success: result.success,
      message: result.message,
      streak: result.streak,
      heroPoints: result.heroPoints,
      nextEligibleAt: result.nextEligibleAt,
    });
  } catch (err) {
    console.error("Check-in error:", err);

    return res.status(500).json({
      success: false,
      message: "Server error while processing check-in",
    });
  }
};
