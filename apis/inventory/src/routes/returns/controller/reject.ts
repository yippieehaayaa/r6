import { rejectReturn } from "@r6/db-inventory";
import { RejectReturnSchema } from "@r6/schemas/inventory";
import type { NextFunction, Request, Response } from "express";
import { extractTenantContext } from "../../tenants/helpers";

export async function rejectReturnHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { tenantId, performedBy } = extractTenantContext(req);
    const returnRequestId = req.params.returnRequestId as string;
    RejectReturnSchema.parse(req.body ?? {});

    const result = await rejectReturn({
      tenantId,
      rejectedBy: performedBy,
      returnRequestId,
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
