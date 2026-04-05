import { listTenants } from "@r6/db-identity-and-access";
import { ListTenantsQuerySchema } from "@r6/schemas/identity-and-access";
import type { NextFunction, Request, Response } from "express";

export async function list(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { page, limit, search } = ListTenantsQuerySchema.parse(req.query);
    const isActive =
      req.query.isActive === "true"
        ? true
        : req.query.isActive === "false"
          ? false
          : undefined;
    const result = await listTenants({ page, limit, isActive, search });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
