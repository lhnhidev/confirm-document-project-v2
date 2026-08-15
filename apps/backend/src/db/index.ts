import mongoose from "mongoose";

// Fail queries immediately instead of buffering/hanging when there is no active
// connection (missing MONGO_URI, blocked Atlas IP access, etc). Without this,
// a stalled connection makes every query wait until the serverless function's
// execution timeout kills the request (FUNCTION_INVOCATION_FAILED on Vercel).
mongoose.set("bufferCommands", false);

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
