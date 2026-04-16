import { getReturnRequest, listReturnRequests } from "@r6/db-inventory";
import {
  GetByUuidParamsSchema,
  ListReturnRequestsQuerySchema,
} from "@r6/schemas/inventory";
import type { NextFunction, Request, Response } from "express";
import { extractTenantContext } from "../../tenants/helpers";

export async function listReturnRequestsHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { tenantId } = extractTenantContext(req);
    const query = ListReturnRequestsQuerySchema.parse(req.query);
    const result = await listReturnRequests({ tenantId, ...query });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getReturnRequestHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { tenantId } = extractTenantContext(req);
    const { id } = GetByUuidParamsSchema.parse(req.params);
    const result = await getReturnRequest({ tenantId, id });
    if (!result) {
      res.status(404).json({ code: "not_found", message: "Return not found" });
      return;
    }
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
