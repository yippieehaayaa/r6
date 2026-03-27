import { restoreIdentity } from "@r6/db-identity-and-access";
import type { NextFunction, Request, Response } from "express";
import { toSafeIdentity } from "../helpers";

export async function restore(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = req.params.id as string;
    const restored = await restoreIdentity(id);
    res.status(200).json(toSafeIdentity(restored));
  } catch (error) {
    next(error);
  }
}
