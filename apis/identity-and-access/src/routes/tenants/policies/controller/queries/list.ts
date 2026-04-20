import { listPolicies } from "@r6/db-identity-and-access";
import { ListPoliciesQuerySchema } from "@r6/schemas";
import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../../../../lib/errors";
import { resolveParam } from "../../../helpers";

// GET /tenants/:tenantId/policies
// Returns a paginated list of policies belonging to this tenant.
// Optional filters: search (name / displayName / description), isManaged.
// Tenant scope is enforced by the parent router guard.
// Requires: iam:policy:read
export const listPoliciesHandler = async (
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

    const parsed = ListPoliciesQuerySchema.safeParse(req.query);

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

    const { page, limit, search, isManaged } = parsed.data;

    const result = await listPolicies({
      tenantId,
      page,
      limit,
      search,
      isManaged,
    });

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
