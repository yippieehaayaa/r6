import { receiveReturn } from "@r6/db-inventory";
import { ReceiveReturnSchema } from "@r6/schemas/inventory";
import type { NextFunction, Request, Response } from "express";
import { extractTenantContext } from "../../tenants/helpers";

export async function receiveReturnHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { tenantId, performedBy } = extractTenantContext(req);
    const returnRequestId = req.params.returnRequestId as string;
    const body = ReceiveReturnSchema.parse(req.body);

    const result = await receiveReturn({
      tenantId,
      performedBy,
      returnRequestId,
      ...body,
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
