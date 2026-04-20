import mongoose from "mongoose";
import { isDemoMode } from "./env.js";

let connectionPromise;

const connectDB = async () => {
  if (isDemoMode) {
    console.log("Demo mode enabled: skipping MongoDB connection.");
    return;
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (mongoose.connection.readyState === 2 && connectionPromise) {
    return connectionPromise;
  }

  const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ai-smart-restaurant";

  try {
    connectionPromise = mongoose.connect(mongoUri);
    await connectionPromise;
    console.log(`MongoDB connected: ${mongoose.connection.host}`);
    return mongoose.connection;
  } catch (error) {
    connectionPromise = undefined;
    console.error("MongoDB connection failed:", error.message);

    if (process.env.VERCEL === "1") {
      throw error;
    }

    process.exit(1);
  }
};

export default connectDB;
