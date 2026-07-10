import express from "express";
import cors from "cors";
import morgan from "morgan";
import { connectDB } from "./config/db.js";
import { asyncHandler } from "./utils/asyncHandler.js";
import authRoutes from "./routes/auth.js";
import containerRoutes from "./routes/containers.js";
import itemRoutes from "./routes/items.js";
import searchRoutes from "./routes/search.js";

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "*" }));
app.use(express.json());
app.use(morgan("dev"));

// On Vercel each request may hit a cold serverless invocation with no live
// DB connection yet; connectDB() caches its connection promise so this is a
// no-op once warm (and in local dev, index.js already connected before
// listen() runs, so this resolves instantly there too).
app.use(asyncHandler(async (_req, _res, next) => {
  await connectDB();
  next();
}));

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/containers", containerRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/search", searchRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  if (err.name === "ValidationError") {
    return res.status(400).json({ message: err.message });
  }
  if (err.code === 11000) {
    return res.status(409).json({ message: "Duplicate value", key: err.keyValue });
  }
  res.status(500).json({ message: "Internal server error" });
});

export default app;
