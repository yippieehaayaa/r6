import { restorePolicy } from "@r6/db-identity-and-access";
import type { NextFunction, Request, Response } from "express";

export async function restore(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = req.params.id as string;
    const restored = await restorePolicy(id);
    res.status(200).json(restored);
  } catch (error) {
    next(error);
  }
}
