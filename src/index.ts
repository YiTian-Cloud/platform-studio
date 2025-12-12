// src/index.ts
import express from "express";
import path from "path";
import morgan from "morgan";
import { registerRoutesV1 } from "./api/v1/routes";

// PLATFORM_IMPORTS (plugins may inject more here)

const app = express();

// Core middleware
app.use(express.json());
app.use(morgan("dev"));

// Serve static landing page & assets from src/public
app.use(express.static(path.join(__dirname, "public")));

// PLATFORM_MIDDLEWARE (plugins may inject more here)

// Root health
app.get("/health", (_req, res) => {
  return res.json({ status: "ok", uptime: process.uptime() });
});

// Mount versioned API
app.use("/api/v1", registerRoutesV1());

// PLATFORM_ROUTES (plugins may inject more routes here)

// Export app for tests & tooling
export default app;

// Only start the HTTP server if run directly (not in tests)
if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Service listening on port ${port}`);
  });
}
