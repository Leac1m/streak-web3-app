import { Router } from "express";
import { getProfileController } from "../controllers/profile.controller.js";

const router = Router();

// GET /profile
router.get("/", getProfileController);

export default router;