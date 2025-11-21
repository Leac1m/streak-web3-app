import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.json({ status: "OK", message: "API running" });
});

export default router;