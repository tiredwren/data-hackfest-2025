import mongoose from "mongoose";

const FocusSessionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: Date,
  duration: Number, // in milliseconds
  completed: { type: Boolean, default: false },
  distractions: [{
    timestamp: Date,
    type: String, // 'click_away', 'distraction_site'
    details: String
  }],
  date: { type: String, required: true } // YYYY-MM-DD format
});

export default mongoose.model("FocusSession", FocusSessionSchema);