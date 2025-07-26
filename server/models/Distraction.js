import mongoose from "mongoose";

const DistractionSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  reason: String,
  userId: String,
});

export default mongoose.model("Distraction", DistractionSchema);
