import "dotenv/config";
import mongoose from "mongoose";
import { Evidence } from "../models/evidence.model.ts";
import { Field } from "../models/field.model.ts";

async function main() {
  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI) {
    throw new Error("MONGO_URI not found in .env");
  }

  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
  console.log("Connected to MongoDB Atlas");

  const evidenceResult = await Evidence.deleteMany({});
  console.log(`Deleted ${evidenceResult.deletedCount} evidence documents (including attachments and comments)`);

  const fields = await Field.find({});
  let updatedFields = 0;
  for (const field of fields) {
    field.criteria = field.criteria.map((c) => ({ ...c, status: "incomplete" })) as any;
    field.percent = 0;
    await field.save();
    updatedFields++;
  }
  console.log(`Reset criteria status to "incomplete" and percent to 0 for ${updatedFields} fields`);

  await mongoose.disconnect();
  console.log("Done. Disconnected.");
}

main().catch((err) => {
  console.error("Error running reset script:", err);
  process.exit(1);
});
