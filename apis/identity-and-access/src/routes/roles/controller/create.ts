import { createRole } from "@r6/db-identity-and-access";
import { CreateRoleSchema } from "@r6/schemas/identity-and-access";
import type { NextFunction, Request, Response } from "express";

export async function createRoleHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const tenantId = req.params.tenantId as string;
    const body = CreateRoleSchema.parse(req.body);
    const role = await createRole({
      tenantId,
      name: body.name,
      description: body.description ?? null,
    });
    res.status(201).json(role);
  } catch (error) {
    next(error);
  }
}
