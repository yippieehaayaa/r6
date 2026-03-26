import type { NextFunction, Request, Response } from "express";
import { ensureTenantExistsBySlug } from "../../tenants/helpers";
import {
  ensureIdentityBelongsToTenantWithDetails,
  toSafeIdentity,
} from "../helpers";

export async function getIdentity(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const tenantSlug = req.params.tenantSlug as string;
    const tenant = await ensureTenantExistsBySlug(tenantSlug);
    const id = req.params.id as string;
    const identity = await ensureIdentityBelongsToTenantWithDetails(
      id,
      tenant.id,
    );
    res.status(200).json(toSafeIdentity(identity));
  } catch (error) {
    next(error);
  }
}
