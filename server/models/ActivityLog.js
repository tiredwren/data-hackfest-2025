import mongoose from "mongoose";

const ActivityLogSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  type: { 
    type: String, 
    required: true,
    enum: ['page_view', 'tab_switch', 'focus_start', 'focus_end', 'distraction', 'app_switch']
  },
  url: String,
  title: String,
  domain: String,
  isDistraction: { type: Boolean, default: false },
  sessionId: String, // for focus sessions
  date: { type: String, required: true } // YYYY-MM-DD format
});

export default mongoose.model("ActivityLog", ActivityLogSchema);