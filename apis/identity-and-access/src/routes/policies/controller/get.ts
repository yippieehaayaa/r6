import type { NextFunction, Request, Response } from "express";
import {
  ensurePolicyExists,
  ensurePolicyInModuleScope,
  resolveTenantModuleAccess,
} from "../helpers";

export async function getPolicy(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = req.params.id as string;
    const policy = await ensurePolicyExists(id);
    const payload = req.jwtPayload;

    if (payload?.kind !== "ADMIN") {
      // Non-Admin callers may only fetch policies within their module scope.
      const moduleAccess = await resolveTenantModuleAccess(
        payload?.tenantSlug as string,
      );
      ensurePolicyInModuleScope(policy, moduleAccess);
    }

    res.status(200).json(policy);
  } catch (error) {
    next(error);
  }
}
