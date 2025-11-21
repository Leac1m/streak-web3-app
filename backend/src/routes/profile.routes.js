import { Router } from "express";
import { getProfileController } from "../controllers/profile.controller.js";

const router = Router();

/**
 * @swagger
 * /profile:
 *   get:
 *     summary: Get authenticated user's profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns profile and streak info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 walletAddress:
 *                   type: string
 *                 dailyStreak:
 *                   type: number
 *                 heroPoints:
 *                   type: number
 *                 lastCheckIn:
 *                   type: string
 *                 nextEligibleCheckIn:
 *                   type: string
 *       401:
 *         description: Unauthorized
 */
router.get("/", getProfileController);

export default router;