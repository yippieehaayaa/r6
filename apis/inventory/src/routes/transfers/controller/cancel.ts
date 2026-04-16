import { cancelTransfer } from "@r6/db-inventory";
import { CancelTransferSchema } from "@r6/schemas/inventory";
import type { NextFunction, Request, Response } from "express";
import { extractTenantContext } from "../../tenants/helpers";

export async function cancelTransferHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { tenantId, performedBy } = extractTenantContext(req);
    const transferId = req.params.transferId as string;
    CancelTransferSchema.parse(req.body ?? {});

    const result = await cancelTransfer({
      tenantId,
      performedBy,
      transferId,
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
