import mongoose from "mongoose";
import { isDemoMode } from "./env.js";

const connectDB = async () => {
  if (isDemoMode) {
    console.log("Demo mode enabled: skipping MongoDB connection.");
    return;
  }

  const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ai-smart-restaurant";

  try {
    await mongoose.connect(mongoUri);
    console.log(`MongoDB connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;
