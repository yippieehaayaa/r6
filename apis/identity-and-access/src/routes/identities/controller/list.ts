import { listIdentities } from "@r6/db-identity-and-access";
import { ListIdentitiesQuerySchema } from "@r6/schemas/identity-and-access";
import type { NextFunction, Request, Response } from "express";
import { ensureTenantExistsBySlug } from "../../tenants/helpers";
import { toSafeIdentity } from "../helpers";

export async function list(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const tenantSlug = req.params.tenantSlug as string;
    const tenant = await ensureTenantExistsBySlug(tenantSlug);
    const { page, limit, search } = ListIdentitiesQuerySchema.parse(req.query);

    const result = await listIdentities({
      tenantId: tenant.id,
      page,
      limit,
      search,
    });
    res.status(200).json({
      ...result,
      data: result.data.map(toSafeIdentity),
    });
  } catch (error) {
    next(error);
  }
}
