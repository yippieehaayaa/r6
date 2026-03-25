import { listTenants } from "@r6/db-identity-and-access";
import type { NextFunction, Request, Response } from "express";

export async function list(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const isActive =
      req.query.isActive === "true"
        ? true
        : req.query.isActive === "false"
          ? false
          : undefined;
    const result = await listTenants({ page, limit, isActive });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
