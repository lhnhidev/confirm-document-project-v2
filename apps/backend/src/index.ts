import express, { type Express, type Request, type Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connect } from "./db/index.ts";
import authRoutes from "./routes/auth.routes.ts";
import evidenceRoutes from "./routes/evidence.routes.ts";
import fieldRoutes from "./routes/field.routes.ts";
import { syncSeedUsersToDatabase } from "./db/seedUsersData.ts";
import { syncFieldsToDatabase } from "./db/seedFieldsData.ts";

dotenv.config();

const app: Express = express();
const PORT = process.env.BACKEND_PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Connect database and seed initial data if empty
connect().then(async () => {
  await syncSeedUsersToDatabase();
  await syncFieldsToDatabase();
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/evidences", evidenceRoutes);
app.use("/api/fields", fieldRoutes);

// Health check
app.get("/api/health", (req: Request, res: Response) => {
  res.json({
    status: "online",
    service: "Confirm Documents Backend API Server",
    timestamp: new Date().toISOString()
  });
});

app.get("/", (req: Request, res: Response) => {
  res.send("Confirm Documents Backend API running smoothly on port 5000!");
});

app.listen(PORT, () => {
  console.log(`🚀 Backend Express Auth Server running at http://localhost:${PORT}`);
});
