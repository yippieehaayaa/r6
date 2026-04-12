import { cancelReturn } from "@r6/db-inventory";
import { CancelReturnRequestSchema } from "@r6/schemas/inventory";
import type { NextFunction, Request, Response } from "express";
import { extractTenantContext } from "../../tenants/helpers";

export async function cancelReturnHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { tenantId, performedBy } = extractTenantContext(req);
    const returnRequestId = req.params.returnRequestId as string;
    CancelReturnRequestSchema.parse(req.body ?? {});

    const result = await cancelReturn({
      tenantId,
      cancelledBy: performedBy,
      returnRequestId,
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
