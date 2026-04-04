import type { NextFunction, Request, Response } from "express";
import { ensurePolicyExists } from "../helpers";

export async function getPolicy(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = req.params.id as string;
    const policy = await ensurePolicyExists(id);
    res.status(200).json(policy);
  } catch (error) {
    next(error);
  }
}
