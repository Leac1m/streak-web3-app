import { Router } from "express";
import { getLeaderboardController } from "../controllers/leaderboard.controller.js";
import { validate, schemas } from "../middlewares/validate.js";
import Joi from 'joi';

const router = Router();

/**
 * @swagger
 * /leaderboard:
 *   get:
 *     summary: Get leaderboard of top 10 users by hero points
 *     tags: [Leaderboard]
 *     responses:
 *       200:
 *         description: List of top users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   walletAddress:
 *                     type: string
 *                   heroPoints:
 *                     type: number
 */
router.get("/", validate({ query: Joi.object({ limit: schemas.leaderboardLimit }) }), getLeaderboardController);

export default router;
