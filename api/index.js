// Vercel serverless entrypoint. Every request under /api/* (per vercel.json's
// rewrite) lands here; the Express app itself is a valid (req, res) handler,
// so no adapter is needed — just export it. DB connection is established
// lazily per-invocation by app.js's own middleware, with the connection
// cached across warm invocations (see server/src/config/db.js).
import app from "../server/src/app.js";

export default app;
