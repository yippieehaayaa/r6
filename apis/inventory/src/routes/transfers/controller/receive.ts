import { receiveTransfer } from "@r6/db-inventory";
import { ReceiveTransferSchema } from "@r6/schemas/inventory";
import type { NextFunction, Request, Response } from "express";
import { extractTenantContext } from "../../tenants/helpers";

export async function receiveTransferHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { tenantId, performedBy } = extractTenantContext(req);
    const transferId = req.params.transferId as string;
    const body = ReceiveTransferSchema.parse(req.body);

    const result = await receiveTransfer({
      tenantId,
      performedBy,
      transferId,
      ...body,
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
