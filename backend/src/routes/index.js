import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.js";
import checkInRoutes from "./checkin.routes.js";
import profileRoutes from "./profile.routes.js";
import leaderboardRoutes from "./leaderboard.routes.js";
import authRoutes from "./auth.routes.js";


const router = Router();

router.get("/", (req, res) => {
  res.json({ status: "OK", message: "API running" });
});

// Uprotected routes
router.use("/auth", authRoutes);
router.use("/leaderboard", leaderboardRoutes);

// Protected routes
router.use("/check-in", authMiddleware, checkInRoutes);
router.use("/profile", authMiddleware, profileRoutes);

export default router;