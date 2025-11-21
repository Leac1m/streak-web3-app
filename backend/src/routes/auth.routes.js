import { Router } from "express";
import { authController } from "../controllers/auth.controller.js";
import { generateNonceController } from "../controllers/generateNonce.controller.js";

const router = Router();

/**
 * @swagger
 * /auth/nonce:
 *   post:
 *     summary: Generate a one-time nonce for TON wallet authentication
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               walletAddress:
 *                 type: string
 *                 example: "UQxxxx"
 *     responses:
 *       200:
 *         description: Nonce generated
 *       400:
 *         description: Missing wallet address
 */
router.post("/nonce", generateNonceController);

/**
 * @swagger
 * /auth:
 *   post:
 *     summary: Authenticate user via TON wallet signature
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - walletAddress
 *               - signature
 *               - message
 *             properties:
 *               walletAddress:
 *                 type: string
 *                 example: "EQC1234abcd..."
 *               signature:
 *                 type: string
 *                 example: "base64-signature-string"
 *               message:
 *                 type: string
 *                 example: "1739283812-xyz"
 *     responses:
 *       200:
 *         description: Authenticated successfully, returns JWT token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       400:
 *         description: Missing fields or invalid signature
 */
router.post("/", authController);

export default router;