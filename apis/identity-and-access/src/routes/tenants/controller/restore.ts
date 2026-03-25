import { restoreTenant } from "@r6/db-identity-and-access";
import type { NextFunction, Request, Response } from "express";

export async function restore(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const restored = await restoreTenant(req.params.tenantId as string);
    res.status(200).json(restored);
  } catch (error) {
    next(error);
  }
}
