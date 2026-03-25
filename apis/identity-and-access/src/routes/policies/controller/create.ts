import { createPolicy } from "@r6/db-identity-and-access";
import { CreatePolicySchema } from "@r6/schemas/identity-and-access";
import type { NextFunction, Request, Response } from "express";

export async function createPolicyHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const tenantId = req.params.tenantId as string;
    const body = CreatePolicySchema.parse(req.body);
    const policy = await createPolicy({ ...body, tenantId });
    res.status(201).json(policy);
  } catch (error) {
    next(error);
  }
}
