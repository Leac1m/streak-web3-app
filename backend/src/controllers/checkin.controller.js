import { processCheckIn } from "../services/checkin.service.js";
import { unauthorized } from "../utils/ApiError.js";

export const checkInController = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      throw unauthorized();
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
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, message: err.message, details: err.details });
    }
    return res.status(500).json({ success: false, message: "Server error while processing check-in" });
  }
};
