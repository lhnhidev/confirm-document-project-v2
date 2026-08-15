import { app } from "../apps/backend/src/app.ts";

// Vercel Serverless Function entry point: forwards every /api/* request into the Express app.
export default app;
