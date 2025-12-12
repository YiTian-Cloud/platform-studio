import { Router } from "express";
import { HealthController } from "./controllers/HealthController";
import { ExampleController } from "./controllers/ExampleController";

/**
 * registerRoutesV1 creates the v1 API router
 * and wires all controllers + routes.
 */
export function registerRoutesV1() {
  const router = Router();

  // Instantiate controllers
  const healthController = new HealthController();
  const exampleController = new ExampleController();

  // ---------------------------------------------------------
  // Health endpoint for API version 1
  // ---------------------------------------------------------
  router.get("/health", (req, res) => healthController.get(req, res));

  // ---------------------------------------------------------
  // Example CRUD demo endpoints
  // Developers will replace this with real domain logic
  // ---------------------------------------------------------
  router.get("/examples", (req, res) => exampleController.list(req, res));
  router.post("/examples", (req, res) => exampleController.create(req, res));

  return router;
}
