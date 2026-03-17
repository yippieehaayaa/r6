import type { Request, Response } from "express";
import { healthService } from "./health.service";

export function getLiveness(_req: Request, res: Response): void {
  res.status(200).json(healthService.getLiveness());
}

export async function getReadiness(
  _req: Request,
  res: Response,
): Promise<void> {
  const payload = await healthService.getReadiness();
  res.status(payload.status === "ready" ? 200 : 503).json(payload);
}
