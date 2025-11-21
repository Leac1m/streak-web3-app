import { Router } from "express";
import checkInRoutes from "./checkin.routes.js";

const router = Router();

router.get("/", (req, res) => {
  res.json({ status: "OK", message: "API running" });
});

router.use("/check-in", checkInRoutes);

export default router;