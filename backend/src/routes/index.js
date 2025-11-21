import { Router } from "express";
import checkInRoutes from "./checkin.routes.js";
import profileRoutes from "./profile.routes.js";
import leaderboardRoutes from "./leaderboard.routes.js";

const router = Router();

router.get("/", (req, res) => {
  res.json({ status: "OK", message: "API running" });
});

router.use("/check-in", checkInRoutes);
router.use("/profile", profileRoutes);
router.use("/leaderboard", leaderboardRoutes);

export default router;