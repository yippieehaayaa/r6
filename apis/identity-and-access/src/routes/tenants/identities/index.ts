import { Router } from "express";
import { requirePermission } from "../../../middleware/guard";
import { assertTenantAccess, resolveParam } from "../helpers";
import type { AuthJwtPayload } from "../../../middleware/auth";

// Sub-router mounted at /tenants/:tenantId/identities via the tenants router.
// mergeParams: true is required so that :tenantId from the parent route is
// accessible within this router via req.params.tenantId.
const router: Router = Router({ mergeParams: true });

// Tenant scope guard — applied to every identity management route.
// Only identities whose JWT tenantId matches the URL :tenantId may proceed.
// This is the first line of defence; permission checks follow per-route.
router.use((req, res, next) => {
	const payload = req.jwtPayload as AuthJwtPayload;
	const tenantId = resolveParam(req, "tenantId");

	if (!tenantId) {
		res.status(400).json({ error: { code: "validation_error", message: "Tenant ID is required" } });
		return;
	}

	try {
		assertTenantAccess(payload, tenantId);
		next();
	} catch (err) {
		next(err);
	}
});

// ── Queries (GET) ────────────────────────────────────────────────────────────

// GET /tenants/:tenantId/identities
//   Lists identities belonging to this tenant (paginated).
//   Requires: iam:identity:read
router.get("/", requirePermission("iam:identity:read"), (_req, res) => {
	res.status(501).json({ error: { code: "not_implemented", message: "Not implemented yet" } });
});

// GET /tenants/:tenantId/identities/:id
//   Fetches a single identity by ID within this tenant.
//   Requires: iam:identity:read
router.get("/:id", requirePermission("iam:identity:read"), (_req, res) => {
	res.status(501).json({ error: { code: "not_implemented", message: "Not implemented yet" } });
});

// ── Mutations (POST / PATCH / DELETE) ────────────────────────────────────────

// POST /tenants/:tenantId/identities
//   Creates a new identity within this tenant.
//   Requires: iam:identity:create
router.post("/", requirePermission("iam:identity:create"), (_req, res) => {
	res.status(501).json({ error: { code: "not_implemented", message: "Not implemented yet" } });
});

// PATCH /tenants/:tenantId/identities/:id
//   Updates an identity's profile fields (name, country, etc.).
//   Requires: iam:identity:update
router.patch("/:id", requirePermission("iam:identity:update"), (_req, res) => {
	res.status(501).json({ error: { code: "not_implemented", message: "Not implemented yet" } });
});

// DELETE /tenants/:tenantId/identities/:id
//   Soft-deletes an identity within this tenant.
//   Requires: iam:identity:delete
router.delete("/:id", requirePermission("iam:identity:delete"), (_req, res) => {
	res.status(501).json({ error: { code: "not_implemented", message: "Not implemented yet" } });
});

// POST /tenants/:tenantId/identities/:id/restore
//   Restores a soft-deleted identity.
//   Requires: iam:identity:restore
router.post("/:id/restore", requirePermission("iam:identity:restore"), (_req, res) => {
	res.status(501).json({ error: { code: "not_implemented", message: "Not implemented yet" } });
});

// ── Role assignment ───────────────────────────────────────────────────────────

// POST /tenants/:tenantId/identities/:id/roles
//   Assigns a role to an identity.
//   Requires: iam:role:assign
router.post("/:id/roles", requirePermission("iam:role:assign"), (_req, res) => {
	res.status(501).json({ error: { code: "not_implemented", message: "Not implemented yet" } });
});

// DELETE /tenants/:tenantId/identities/:id/roles/:roleId
//   Removes a specific role from an identity.
//   Requires: iam:role:assign
router.delete("/:id/roles/:roleId", requirePermission("iam:role:assign"), (_req, res) => {
	res.status(501).json({ error: { code: "not_implemented", message: "Not implemented yet" } });
});

// PUT /tenants/:tenantId/identities/:id/roles
//   Replaces all roles on an identity atomically.
//   Requires: iam:role:assign
router.put("/:id/roles", requirePermission("iam:role:assign"), (_req, res) => {
	res.status(501).json({ error: { code: "not_implemented", message: "Not implemented yet" } });
});

export default router;
