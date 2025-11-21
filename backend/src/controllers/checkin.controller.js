import { processCheckIn } from "../services/checkin.service.js";

export const checkInController = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const result = await processCheckIn(user._id);

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
