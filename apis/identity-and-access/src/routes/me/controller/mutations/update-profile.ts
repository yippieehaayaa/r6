import { updateIdentity } from "@r6/db-identity-and-access";
import { UpdateProfileSchema } from "@r6/schemas";
import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../../../lib/errors";
import type { AuthJwtPayload } from "../../../../middleware/auth";
import { toSafeIdentity } from "../../../tenants/identities/helpers";

// PATCH /me
// Updates mutable personal profile fields on the authenticated identity.
// Only the identity itself may call this — no admin override.
export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const payload = req.jwtPayload as AuthJwtPayload;
    const identityId = payload.sub;

    if (!identityId) {
      return next(new AppError(401, "unauthorized", "Authentication required"));
    }

    const parsed = UpdateProfileSchema.safeParse(req.body);

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

    const updated = await updateIdentity(identityId, undefined, parsed.data);

    res.status(200).json(toSafeIdentity(updated));
  } catch (err) {
    next(err);
  }
};
