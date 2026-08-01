import mongoose from "mongoose";

export const connect = async () => {
  const MONGO_URI = process.env.MONGO_URI;

  mongoose.set("bufferCommands", false);

  if (!MONGO_URI) {
    console.warn("⚠️ MONGO_URI not found in .env — running in mock/offline mode");
    return;
  }

  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected MongoDB Atlas!");
  } catch (err) {
    console.warn("⚠️ Error connecting to MongoDB Atlas:", err);
  }
};
