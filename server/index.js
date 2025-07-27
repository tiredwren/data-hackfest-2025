// code from ChatGPT for backend server setup
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import distractionRoutes from "./routes/distractions.js";
import userRoutes from "./routes/users.js";
import focusRoutes from "./routes/focus.js";
import activityRoutes from "./routes/activity.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/distractions", distractionRoutes);
app.use("/api/users", userRoutes);
app.use("/api/focus", focusRoutes);
app.use("/api/activity", activityRoutes);

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("MongoDB connected");
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})
.catch((err) => console.error("MongoDB connection error:", err));
