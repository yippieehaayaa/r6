import { randomBytes } from "node:crypto";
import { sha256 } from "@r6/crypto";
import { createInvitation, getTenantById } from "@r6/db-identity-and-access";
import { sendEmail } from "@r6/email";
import { CreateInvitationSchema } from "@r6/schemas";
import type { NextFunction, Request, Response } from "express";
import { env } from "../../../../config";
import { AppError } from "../../../../lib/errors";
import type { AuthJwtPayload } from "../../../../middleware/auth";
import { INVITATION_TTL_MS } from "../../constants";
import {
  assertTenantAccess,
  resolveParam,
  toSafeInvitation,
} from "../../helpers";

// POST /tenants/:tenantId/invitations
//
// Sends an invitation email to the specified address, granting access to this tenant.
//
// Security notes:
//   - Only identities whose JWT tenantId matches :tenantId may send invitations.
//   - tenantId and invitedById are always read from the verified JWT / validated tenant —
//     never from the request body.
//   - The raw invitation token is generated with cryptographically secure randomness
//     (32 bytes = 256 bits of entropy) and only its SHA-256 hash is stored.
//   - The raw token is emailed to the invitee and then discarded — it is never logged.
export async function invite(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const payload = req.jwtPayload as AuthJwtPayload;
    const tenantId = resolveParam(req, "tenantId");

    if (!tenantId) {
      return next(
        new AppError(400, "validation_error", "Tenant ID is required"),
      );
    }

    // Enforce tenant scope — only members of this tenant may send invitations.
    assertTenantAccess(payload, tenantId);

    const invitedById = payload.sub;
    if (!invitedById) {
      return next(
        new AppError(401, "unauthorized", "Identity not found in token"),
      );
    }

    // Verify the target tenant exists and is active.
    const tenant = await getTenantById(tenantId);
    if (!tenant) {
      return next(new AppError(404, "not_found", "Tenant not found"));
    }
    if (!tenant.isActive) {
      return next(new AppError(403, "forbidden", "Tenant is not active"));
    }

    const { email, policyIds } = CreateInvitationSchema.parse(req.body);

    // Generate a cryptographically secure random token (256-bit entropy).
    // The raw token is sent in the email; only its SHA-256 hash is stored.
    const rawToken = randomBytes(32).toString("hex");
    const tokenHash = sha256(rawToken);
    const expiresAt = new Date(Date.now() + INVITATION_TTL_MS);

    const invitation = await createInvitation({
      tenantId,
      invitedById,
      email,
      tokenHash,
      expiresAt,
      policyIds,
    });

    const acceptUrl = `${env.APP_URL}/r6/accept-invitation?token=${rawToken}`;

    await sendEmail({
      to: email,
      subject: `You've been invited to join ${tenant.name} — r6`,
      senderAddress: env.AZURE_COMMUNICATION_SENDER_ADDRESS,
      html: `
				<html>
					<body style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
						<h1 style="font-size: 24px; margin-bottom: 8px;">You've been invited</h1>
						<p>You've been invited to join <strong>${tenant.name}</strong> on r6.</p>
						<p>Click the button below to accept this invitation. The link expires in <strong>7 days</strong>.</p>
						<div style="margin: 32px 0;">
							<a href="${acceptUrl}" style="display: inline-block; background: #18181b; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 15px; font-weight: 500;">Accept Invitation</a>
						</div>
						<p style="color: #71717a; font-size: 13px; word-break: break-all;">
							Or copy this link into your browser:<br />
							<a href="${acceptUrl}" style="color: #71717a;">${acceptUrl}</a>
						</p>
						<p style="color: #71717a; font-size: 13px; margin-top: 24px;">
							If you did not expect this invitation, you can safely ignore this email.
						</p>
					</body>
				</html>
			`,
    });

    // Return the safe invitation record — tokenHash is stripped.
    res.status(201).json(toSafeInvitation(invitation));
  } catch (err) {
    next(err);
  }
}
