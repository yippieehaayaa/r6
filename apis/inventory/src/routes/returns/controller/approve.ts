import { approveReturn } from "@r6/db-inventory";
import type { NextFunction, Request, Response } from "express";
import { extractTenantContext } from "../../tenants/helpers";

export async function approveReturnHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { tenantId, performedBy } = extractTenantContext(req);
    const returnRequestId = req.params.returnRequestId as string;

    const result = await approveReturn({
      tenantId,
      approvedBy: performedBy,
      returnRequestId,
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
