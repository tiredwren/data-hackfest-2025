import express from "express";
import ActivityLog from "../models/ActivityLog.js";

const router = express.Router();

// Log activity
router.post("/", async (req, res) => {
  try {
    const { userId, type, url, title, domain, isDistraction } = req.body;
    
    const activity = new ActivityLog({
      userId,
      type,
      url,
      title,
      domain,
      isDistraction,
      date: new Date().toISOString().split('T')[0]
    });
    
    await activity.save();
    res.json({ message: "Activity logged" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to log activity" });
  }
});

// Get activity stats
router.get("/stats/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;
    
    const activities = await ActivityLog.find({
      userId,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ timestamp: 1 });
    
    // Calculate app switches (consecutive different domains)
    let appSwitches = 0;
    let lastDomain = null;
    
    activities.forEach(activity => {
      if (activity.domain && activity.domain !== lastDomain) {
        if (lastDomain !== null) appSwitches++;
        lastDomain = activity.domain;
      }
    });
    
    // Calculate distraction time
    const distractionActivities = activities.filter(a => a.isDistraction);
    const distractionTime = distractionActivities.length * 30000; // Estimate 30 seconds per distraction
    
    // Calculate total screen time (time between first and last activity)
    const firstActivity = activities[0];
    const lastActivity = activities[activities.length - 1];
    const totalScreenTime = firstActivity && lastActivity ? 
      lastActivity.timestamp - firstActivity.timestamp : 0;
    
    res.json({
      activities,
      appSwitches,
      distractionTime,
      totalScreenTime,
      distractionCount: distractionActivities.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get activity stats" });
  }
});

export default router;