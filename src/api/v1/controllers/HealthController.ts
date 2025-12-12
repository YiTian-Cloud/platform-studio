import { Request, Response } from "express";

export class HealthController {
  get(_req: Request, res: Response) {
    return res.json({ status: "ok", scope: "api/v1" });
  }
}
