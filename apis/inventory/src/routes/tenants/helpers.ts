import type { Request } from "express";
import { AppError } from "../../lib/errors";
import type { AuthJwtPayload } from "../../middleware/auth";

export function extractTenantContext(req: Request) {
  const payload = req.jwtPayload as AuthJwtPayload | undefined;

  if (!payload) {
    throw new AppError(401, "unauthorized", "Authentication required");
  }

  const tenantId = payload.tenantId;
  const performedBy = payload.sub;

  if (!tenantId) {
    throw new AppError(400, "bad_request", "Token is missing tenantId claim");
  }

  if (!performedBy) {
    throw new AppError(400, "bad_request", "Token is missing sub claim");
  }

  return { tenantId, performedBy };
}
