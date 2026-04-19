import { listInvitations } from "@r6/db-identity-and-access";
import { ListInvitationsQuerySchema } from "@r6/schemas";
import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../../../lib/errors";
import type { AuthJwtPayload } from "../../../../middleware/auth";
import { assertTenantAccess, resolveParam, toSafeInvitation } from "../../helpers";

// GET /tenants/:tenantId/invitations
//
// Returns a paginated list of invitations for this tenant.
// tokenHash is stripped from every record — it is never sent to clients.
//
// Security notes:
//   - Only members of this tenant may list invitations.
export async function listInvitationsHandler(
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

		// Enforce tenant scope.
		assertTenantAccess(payload, tenantId);

		const { page, limit, includeAccepted } = ListInvitationsQuerySchema.parse(
			req.query,
		);

		const result = await listInvitations({
			tenantId,
			page: Math.max(1, page),
			limit: Math.min(100, Math.max(1, limit)),
			includeAccepted,
		});

		// Strip tokenHash from every record before sending to the client.
		res.json({ ...result, data: result.data.map(toSafeInvitation) });
	} catch (err) {
		next(err);
	}
}
