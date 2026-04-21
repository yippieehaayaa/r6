import { listIdentities } from "@r6/db-identity-and-access";
import { IdentityListItemSchema, ListIdentitiesQuerySchema } from "@r6/schemas";
import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../../../../lib/errors";
import { resolveParam } from "../../../helpers";

// GET /tenants/:tenantId/identities
// Returns a paginated, safe list of identities belonging to this tenant.
// Optional filters: search (username / email), status, kind.
// Requires: iam:identity:read
export const listIdentitiesHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const tenantId = resolveParam(req, "tenantId");

    if (!tenantId) {
      return next(
        new AppError(400, "validation_error", "Tenant ID is required"),
      );
    }

    const parsed = ListIdentitiesQuerySchema.safeParse(req.query);

    if (!parsed.success) {
      return next(
        new AppError(
          400,
          "validation_error",
          "Invalid query parameters",
          parsed.error.flatten(),
        ),
      );
    }

    const { page, limit, search, status, kind } = parsed.data;

    const result = await listIdentities({
      tenantId,
      page,
      limit,
      search,
      status,
      kind,
    });

    res.status(200).json({
      data: result.data.map((i) => IdentityListItemSchema.parse(i)),
      total: result.total,
      page: result.page,
      limit: result.limit,
    });
  } catch (err) {
    next(err);
  }
};
