import { createTenantWithDefaults } from "@r6/db-identity-and-access";
import { CreateTenantSchema } from "@r6/schemas";
import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../../../lib/errors";
import type { AuthJwtPayload } from "../../../../middleware/auth";

// POST /tenants
//
// Creates a new Tenant owned by the authenticated identity.
//
// Security notes:
//   - ownerId is always read from the verified JWT (never from the request body)
//     to prevent callers from forging ownership.
//   - Callers who already belong to a tenant receive 409 — one identity can own
//     at most one tenant at a time (enforced here, not at the DB layer).
//   - createTenantWithDefaults runs atomically: it creates the Tenant, binds
//     the owner's tenantId, and stamps the default owner permissions in a single
//     Prisma transaction.
export async function createTenant(
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> {
	try {
		const payload = req.jwtPayload as AuthJwtPayload;
		const ownerId = payload.sub;

		if (!ownerId) {
			return next(
				new AppError(401, "unauthorized", "Identity not found in token"),
			);
		}

		// Prevent a user from creating a second tenant when they already belong to one.
		if (payload.tenantId) {
			return next(
				new AppError(
					409,
					"tenant_already_exists",
					"You already belong to a tenant",
				),
			);
		}

		const { name, slug, moduleAccess } = CreateTenantSchema.parse(req.body);

		const { tenant } = await createTenantWithDefaults(
			{ name, slug, ownerId, moduleAccess },
			["iam:*:*"],
		);

		res.status(201).json(tenant);
	} catch (err) {
		next(err);
	}
}
