import mongoose from "mongoose";

export async function connectDB() {
  if (!process.env.MONGODB_URI) {
     // In development, we might not have it yet, but it's required for the app to work.
     // The server will fail to start until it's provided.
     console.warn("MONGODB_URI is not set. Database connection will fail.");
     return;
  }
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}
