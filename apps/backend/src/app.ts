import express, { type Express, type Request, type Response, type NextFunction } from "express";
import path from "path";
import dotenv from "dotenv";
import cors from "cors";
import { connect } from "./db/index.ts";
import authRoutes from "./routes/auth.routes.ts";
import evidenceRoutes from "./routes/evidence.routes.ts";
import fieldRoutes from "./routes/field.routes.ts";
import { syncSeedUsersToDatabase } from "./db/seedUsersData.ts";
import { syncFieldsToDatabase } from "./db/seedFieldsData.ts";

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });

export const app: Express = express();

app.use(cors());
app.use(express.json());

// Serve locally-stored evidence files (used when Cloudflare R2 is not configured).
// On Vercel this directory is not persisted across invocations — R2 should be configured in production.
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

let bootstrapped = false;

// Ensure the DB connection + seed data are ready before handling a request.
// Runs once per warm serverless instance (and once at startup for the long-running dev server).
app.use(async (_req: Request, _res: Response, next: NextFunction) => {
  if (!bootstrapped) {
    bootstrapped = true;
    await connect();
    await syncSeedUsersToDatabase();
    await syncFieldsToDatabase();
  }
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/evidences", evidenceRoutes);
app.use("/api/fields", fieldRoutes);

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "online",
    service: "Confirm Documents Backend API Server",
    timestamp: new Date().toISOString()
  });
});

app.get("/", (_req: Request, res: Response) => {
  res.send("Confirm Documents Backend API running smoothly!");
});
