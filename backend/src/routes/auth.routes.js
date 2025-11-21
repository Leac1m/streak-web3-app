import { Router } from "express";
import { authController } from "../controllers/auth.controller.js";
import { generateNonceController } from "../controllers/generateNonce.controller.js";
import { validate, schemas } from "../middlewares/validate.js";
import { authRateLimit, nonceRateLimit } from "../middlewares/rateLimit.js";
import Joi from 'joi';

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
router.post("/nonce", nonceRateLimit, validate({ body: Joi.object({ walletAddress: schemas.walletAddress }) }), generateNonceController);

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
router.post("/", authRateLimit, validate({ body: Joi.object({ walletAddress: schemas.walletAddress, signature: schemas.signature, nonce: schemas.nonce }) }), authController);

export default router;