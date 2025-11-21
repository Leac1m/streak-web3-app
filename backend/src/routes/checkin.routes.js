import { Router } from "express";
import { checkInController } from "../controllers/checkin.controller.js";

const router = Router();

/**
 * @swagger
 * /check-in:
 *   post:
 *     summary: Daily check-in to earn streak points
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Check-in processed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 streak:
 *                   type: number
 *                 heroPoints:
 *                   type: number
 *                 message:
 *                   type: string
 *                   example: "Streak continued! +10 points"
 *       400:
 *         description: Not eligible yet or already checked in
 *       401:
 *         description: Unauthorized
 */
router.post("/", checkInController);

export default router;
