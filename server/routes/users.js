import express from "express";
import User from "../models/User.js";

const router = express.Router();

// Get or create user
router.post("/", async (req, res) => {
  try {
    const { auth0Id, email, name } = req.body;
    
    let user = await User.findOne({ auth0Id });
    
    if (!user) {
      user = new User({ auth0Id, email, name });
      await user.save();
    } else {
      user.lastActiveAt = new Date();
      await user.save();
    }
    
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create/get user" });
  }
});

export default router;