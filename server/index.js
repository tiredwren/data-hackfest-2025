// code from ChatGPT for backend server setup
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import distractionRoutes from "./routes/distractions.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/distractions", distractionRoutes);

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("MongoDB connected");
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})
.catch((err) => console.error("MongoDB connection error:", err));
