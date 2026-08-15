import mongoose from "mongoose";

export const isDbConnected = () => mongoose.connection.readyState === 1;

export const connect = async () => {
  // Reuse the existing connection across serverless invocations instead of reconnecting every call
  if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) {
    return;
  }

  const MONGO_URI = process.env.MONGO_URI;

  if (!MONGO_URI) {
    console.warn("⚠️ MONGO_URI not found in .env — running in mock/offline mode");
    return;
  }

  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 3000 });
    console.log("✅ Connected MongoDB Atlas!");
  } catch (err) {
    console.warn("⚠️ Error connecting to MongoDB Atlas:", err);
  }
};
