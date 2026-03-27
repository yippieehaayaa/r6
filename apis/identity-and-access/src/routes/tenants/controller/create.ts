import { createTenant } from "@r6/db-identity-and-access";
import { CreateTenantSchema } from "@r6/schemas/identity-and-access";
import type { NextFunction, Request, Response } from "express";

export async function createTenantHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const body = CreateTenantSchema.parse(req.body);
    const tenant = await createTenant(body);
    res.status(201).json(tenant);
  } catch (error) {
    next(error);
  }
}
