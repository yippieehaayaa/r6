import { updatePolicy } from "@r6/db-identity-and-access";
import { UpdatePolicySchema } from "@r6/schemas/identity-and-access";
import type { NextFunction, Request, Response } from "express";
import { ensurePolicyExists } from "../helpers";

export async function updatePolicyHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = req.params.id as string;
    await ensurePolicyExists(id);
    const body = UpdatePolicySchema.parse(req.body);
    const updated = await updatePolicy(id, body);
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
}
