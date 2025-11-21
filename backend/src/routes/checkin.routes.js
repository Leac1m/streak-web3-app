import { Router } from "express";
import { checkInController } from "../controllers/checkin.controller.js";

const router = Router();

// POST /check-in
router.post("/", checkInController);

export default router;
