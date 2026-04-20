import { createIdentity, verifyEmail } from "@r6/db-identity-and-access";
import { CreateIdentitySchema } from "@r6/schemas";
import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../../../../lib/errors";
import { resolveParam } from "../../../helpers";
import { toSafeIdentity } from "../../../identities/helpers";

// POST /tenants/:tenantId/identities
// Creates a new USER identity within this tenant.
// Admin-provisioned identities are activated immediately — email verification
// is skipped because an admin is vouching for the account.
// Requires: iam:identity:create
export const createIdentityHandler = async (
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

    const parsed = CreateIdentitySchema.safeParse(req.body);

    if (!parsed.success) {
      return next(
        new AppError(
          400,
          "validation_error",
          "Invalid request body",
          parsed.error.flatten(),
        ),
      );
    }

    const { plainPassword, ...rest } = parsed.data;

    const identity = await createIdentity({
      ...rest,
      tenantId,
      password: plainPassword,
    });

    // Activate immediately — admin-provisioned accounts skip the email
    // verification flow. The identity is usable as soon as it is created.
    const activated = await verifyEmail(identity.id);

    res.status(201).json(toSafeIdentity(activated));
  } catch (err) {
    next(err);
  }
};
