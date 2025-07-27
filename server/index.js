// code from ChatGPT for backend server setup
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import distractionRoutes from "./routes/distractions.js";

dotenv.config({ path: "../.env" });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/distractions", distractionRoutes);

mongoose.connect(process.env.MONGODB_URI)
.then(() => {
  console.log("MongoDB connected");
  app.listen(5000, '0.0.0.0', () => {
    console.log("Server running on port 5000");
    });
})
.catch((err) => console.error("MongoDB connection error:", err));
