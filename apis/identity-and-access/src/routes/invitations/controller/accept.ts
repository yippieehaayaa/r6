import { hmac, sha256 } from "@r6/crypto";
import { acceptInvitation } from "@r6/db-identity-and-access";
import { AcceptInvitationSchema } from "@r6/schemas";
import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../../lib/errors";

// POST /invitations/accept
//
// Accepts a pending invitation using the raw token sent via email.
// This is a public endpoint — no JWT is required.
//
// The invitee must already have an r6 account (registered + email verified).
// On acceptance, their identity is bound to the invitation's tenant and the
// attached policies are expanded into IdentityPermission ALLOW rows.
//
// Security notes:
//   - The raw token is hashed with SHA-256 before the DB lookup — the stored
//     tokenHash is never exposed and cannot be brute-forced without the raw value.
//   - Password verification uses the same HMAC-keyed path as all other auth flows.
//   - All validation errors (expired, not found, email mismatch) return the same
//     vague 400/410 codes to avoid leaking information about invitation state.
export async function acceptInvitationHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { token, username, plainPassword } = AcceptInvitationSchema.parse(
      req.body,
    );

    const tokenHash = sha256(token);

    // Pre-compute the HMAC of the password — acceptInvitation expects the
    // hmac-keyed value so it can call verifyPassword(password, storedHash) directly,
    // consistent with how credentials are stored (bcrypt(hmac(plainPassword))).
    const password = hmac(plainPassword);

    let result: Awaited<ReturnType<typeof acceptInvitation>>;
    try {
      result = await acceptInvitation({ tokenHash, username, password });
    } catch (e) {
      const msg = (e as Error).message;
      if (msg === "invitation_not_found" || msg === "invitation_expired") {
        throw new AppError(
          410,
          "invitation_not_found_or_expired",
          "This invitation link is invalid or has expired",
        );
      }
      if (msg === "invitation_already_accepted") {
        throw new AppError(
          409,
          "invitation_already_accepted",
          "This invitation has already been accepted",
        );
      }
      if (msg === "invalid_credentials" || msg === "email_mismatch") {
        // Treat email mismatch as invalid credentials to avoid account enumeration.
        throw new AppError(
          401,
          "invalid_credentials",
          "Invalid username or password",
        );
      }
      if (msg === "already_in_tenant") {
        throw new AppError(
          409,
          "already_in_tenant",
          "Your account is already associated with a tenant",
        );
      }
      if (msg === "account_not_active") {
        throw new AppError(
          403,
          "account_not_active",
          "Please verify your email address before accepting an invitation",
        );
      }
      throw e;
    }

    // Strip sensitive fields from the identity before responding.
    const { hash, salt, ...safeIdentity } = result.identity;
    // Strip tokenHash from the invitation before responding.
    const { tokenHash: _stripped, ...safeInvitation } = result.invitation;

    res.status(200).json({
      invitation: safeInvitation,
      identity: safeIdentity,
    });
  } catch (err) {
    next(err);
  }
}
