import express from "express";
import FocusSession from "../models/FocusSession.js";
import ActivityLog from "../models/ActivityLog.js";

const router = express.Router();

// Start focus session
router.post("/start", async (req, res) => {
  try {
    const { userId } = req.body;
    const today = new Date().toISOString().split('T')[0];
    
    const session = new FocusSession({
      userId,
      startTime: new Date(),
      date: today
    });
    
    await session.save();
    
    // Log activity
    await new ActivityLog({
      userId,
      type: 'focus_start',
      sessionId: session._id.toString(),
      date: today
    }).save();
    
    res.json(session);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to start focus session" });
  }
});

// End focus session
router.post("/end", async (req, res) => {
  try {
    const { sessionId, userId } = req.body;
    const endTime = new Date();
    
    const session = await FocusSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }
    
    session.endTime = endTime;
    session.duration = endTime - session.startTime;
    session.completed = true;
    await session.save();
    
    // Log activity
    await new ActivityLog({
      userId,
      type: 'focus_end',
      sessionId: sessionId,
      date: new Date().toISOString().split('T')[0]
    }).save();
    
    res.json(session);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to end focus session" });
  }
});

// Log distraction during focus
router.post("/distraction", async (req, res) => {
  try {
    const { sessionId, userId, type, details, url, domain } = req.body;
    
    // Update focus session
    if (sessionId) {
      await FocusSession.findByIdAndUpdate(sessionId, {
        $push: {
          distractions: {
            timestamp: new Date(),
            type,
            details
          }
        }
      });
    }
    
    // Log activity
    await new ActivityLog({
      userId,
      type: 'distraction',
      url,
      domain,
      isDistraction: true,
      sessionId,
      date: new Date().toISOString().split('T')[0]
    }).save();
    
    res.json({ message: "Distraction logged" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to log distraction" });
  }
});

// Get focus stats for a date range
router.get("/stats/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;
    
    const sessions = await FocusSession.find({
      userId,
      date: { $gte: startDate, $lte: endDate }
    });
    
    const totalFocusTime = sessions.reduce((sum, session) => sum + (session.duration || 0), 0);
    const totalDistractions = sessions.reduce((sum, session) => sum + session.distractions.length, 0);
    
    res.json({
      sessions,
      totalFocusTime,
      totalDistractions,
      sessionCount: sessions.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get focus stats" });
  }
});

export default router;