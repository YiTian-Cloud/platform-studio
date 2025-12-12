// src/config/jwt.ts
import { expressjwt } from "express-jwt";

const secret = process.env.JWT_SECRET || "changeme-secret";

/**
 * Public, no-auth-needed endpoints:
 *  - "/" landing page + static assets
 *  - "/health" for k8s / platform checks
 *  - "/metrics" for Prometheus
 *  - "/docs" (Swagger UI)
 */
export const jwtMiddleware = expressjwt({
  secret,
  algorithms: ["HS256"],
}).unless({
  path: [
    "/",                  // landing page
    "/health",            // health check
    "/metrics",           // Prometheus metrics
    "/docs",              // Swagger UI index
    /^\/docs\/.*/,        // Swagger UI assets if self-hosted
    /^\/public\/.*/,      // static files if served under /public
    /^\/favicon\.ico$/,   // favicon
  ],
});
