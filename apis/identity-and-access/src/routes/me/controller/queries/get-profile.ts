import { getIdentityById } from "@r6/db-identity-and-access";
import { IdentitySafeSchema } from "@r6/schemas";
import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../../../lib/errors";
import type { AuthJwtPayload } from "../../../../middleware/auth";

// GET /me
// Returns the full safe profile of the authenticated identity.
// Hash, salt, and totpSecret are stripped before the response.
export const getProfile = async (
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

    const identity = await getIdentityById(identityId);

    if (!identity) {
      return next(new AppError(404, "not_found", "Identity not found"));
    }

    res.status(200).json(IdentitySafeSchema.parse(identity));
  } catch (err) {
    next(err);
  }
};
