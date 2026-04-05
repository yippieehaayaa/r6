import {
  listPolicies,
  listPoliciesForTenant,
} from "@r6/db-identity-and-access";
import { ListPoliciesQuerySchema } from "@r6/schemas/identity-and-access";
import type { NextFunction, Request, Response } from "express";
import { resolveTenantModuleAccess } from "../helpers";

export async function list(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { page, limit, search } = ListPoliciesQuerySchema.parse(req.query);
    const payload = req.jwtPayload;

    if (payload?.kind === "ADMIN") {
      // Admins see the full platform catalog.
      const result = await listPolicies({ page, limit, search });
      res.status(200).json(result);
      return;
    }

    // Non-Admin callers see only policies whose entire audience is within
    // their tenant's availed modules (strict subset rule).
    const moduleAccess = await resolveTenantModuleAccess(
      payload?.tenantSlug as string,
    );
    const result = await listPoliciesForTenant(moduleAccess, {
      page,
      limit,
      search,
    });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
