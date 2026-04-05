import { softDeletePolicy } from "@r6/db-identity-and-access";
import type { NextFunction, Request, Response } from "express";
import { ensurePolicyExists } from "../helpers";

export async function remove(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = req.params.id as string;
    await ensurePolicyExists(id);
    await softDeletePolicy(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
