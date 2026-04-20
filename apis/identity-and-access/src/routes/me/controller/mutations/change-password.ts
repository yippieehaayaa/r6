import { verifyPassword } from "@r6/bcrypt";
import { hmac } from "@r6/crypto";
import {
  changePassword as changePasswordInDb,
  getIdentityById,
} from "@r6/db-identity-and-access";
import { ChangePasswordSchema } from "@r6/schemas";
import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../../../lib/errors";

// PATCH /me/password
//
// Allows the authenticated identity to change their own password.
//
// The request body must include the current password (to prove account
// ownership) and the new password (with its confirmation). On success the
// server updates the hash/salt, clears mustChangePassword, and revokes all
// existing refresh tokens — forcing the user to log in again on all devices.
//
// Guards:
//   - authMiddleware() — identity must be authenticated
//   - Valid current password required (prevents stolen-token account takeover)
//   - New password must satisfy the strength policy
//   - newPassword and confirmPassword must match (validated by Zod)

export async function changePassword(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const identityId = req.jwtPayload?.sub;
    if (!identityId)
      throw new AppError(401, "unauthorized", "Missing identity in token");

    // confirmPassword is validated by Zod (must match newPassword) but is
    // intentionally not forwarded to the model layer.
    const { currentPassword, newPassword } = ChangePasswordSchema.parse(
      req.body,
    );

    const identity = await getIdentityById(identityId);
    if (!identity) throw new AppError(404, "not_found", "Identity not found");

    // Verify current password before allowing the change.
    const valid = await verifyPassword(hmac(currentPassword), identity.hash);
    if (!valid) {
      throw new AppError(
        401,
        "invalid_credentials",
        "Current password is incorrect.",
      );
    }

    await changePasswordInDb(identityId, identity.tenantId, {
      currentPassword,
      newPassword,
    });

    res.status(200).json({ message: "Password changed successfully." });
  } catch (err) {
    next(err);
  }
}
