import { Router } from "express";
import { authController } from "../controllers/auth.controller.js";
import { generateNonceController } from "../controllers/generateNonce.controller.js";

const router = Router();

// Generate nonce
router.post("/nonce", generateNonceController);

// Authenticate user
router.post("/", authController);

export default router;