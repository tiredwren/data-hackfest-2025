import express from "express";
import Distraction from "../models/Distraction.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { reason, userId } = req.body;
    const newDistraction = new Distraction({ reason, userId });
    await newDistraction.save();
    res.status(201).json({ message: "Distraction logged" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to log distraction" });
  }
});

export default router;
