import { listRoles } from "@r6/db-identity-and-access";
import type { NextFunction, Request, Response } from "express";

export async function list(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const tenantId = req.params.tenantId as string;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const result = await listRoles({ tenantId, page, limit });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
