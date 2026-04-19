/**
 * Seed: identity-and-access
 *
 * Destructive — wipes all existing data then re-creates from scratch.
 * Run with: npm run db:seed  (from dbs/identity-and-access/)
 *
 * There is no longer a platform-level ADMIN kind. All users belong to a
 * tenant. Within each tenant there are three tiers, distinguished purely
 * by the permissions stamped on each identity:
 *
 *   Owner        — the tenant creator; has full access (iam:*:* + all module wildcards).
 *                  Identified by Tenant.ownerId.
 *   Tenant Admin — a USER promoted by the owner; has a curated subset of
 *                  permissions (all read, plus identity/invitation management).
 *   User         — a regular member; read-only access within the tenant.
 *
 * Seeded identities
 * ┌────────┬────────────────┬──────┬────────┬───────────────────────────────────────────────────────────────────┐
 * │ login  │ password       │ kind │ tenant │ resolved permissions                                              │
 * ├────────┼────────────────┼──────┼────────┼───────────────────────────────────────────────────────────────────┤
 * │ owner  │ Password@1234! │ USER │ r6     │ iam:*:*  hris:*:*  (Owner — full access)                         │
 * │ admin  │ Password@1234! │ USER │ r6     │ iam:identity:* iam:invitation:* iam:policy:read iam:role:read ... │
 * │ user   │ Password@1234! │ USER │ r6     │ iam:identity:read  iam:policy:read  iam:role:read                 │
 * └────────┴────────────────┴──────┴────────┴───────────────────────────────────────────────────────────────────┘
 *
 * Seeded policies (r6 tenant)
 *   iam:full-access           → iam:*:*
 *   iam:identity:full-access  → iam:identity:create/read/update/delete/restore
 *   iam:identity:manage       → iam:identity:create/read/update/delete
 *   iam:identity:read-only    → iam:identity:read
 *   iam:invitation:manage     → iam:invitation:create/read
 *   iam:role:full-access      → iam:role:create/read/update/delete/restore
 *   iam:role:read-only        → iam:role:read
 *   iam:policy:full-access    → iam:policy:create/read/update/delete/restore
 *   iam:policy:read-only      → iam:policy:read
 *   iam:tenant:full-access    → iam:tenant:create/read/update/delete/restore
 *   hris:full-access          → hris:*:*
 */

import { upsertIdentityPermission } from "../../src/models/identity-permission.js";
import { upsertIdentity } from "./identity.js";
import { upsertPolicy } from "./policy.js";
import { upsertTenant } from "./tenant.js";
import { prisma } from "../../src/client.js";

async function main() {
	console.log("\n── Cleanup ───────────────────────────────────");

	await prisma.refreshToken.deleteMany();
	await prisma.identityPermission.deleteMany();
	await prisma.invitation.deleteMany();
	await prisma.policy.deleteMany();
	// Tenants must be deleted before identities because Tenant.ownerId
	// has onDelete: Restrict — deleting an owner identity while it still
	// owns a tenant would be blocked by the DB.
	await prisma.tenant.deleteMany();
	await prisma.identity.deleteMany();

	console.log("  ✓ All existing data removed");

	// ── Tier 1: Owner identity ─────────────────────────────────────────────
	// Created first (tenantId=null); bound to the tenant once it exists.

	console.log("\n── Owner identity ────────────────────────────");

	const ownerIdentity = await upsertIdentity({
		tenantId: null,
		firstName: "R6",
		lastName: "Owner",
		country: "PH",
		username: "owner",
		email: "owner@r6.com",
		password: "Password@1234!",
		kind: "USER",
	});

	console.log("\n── R6 tenant ─────────────────────────────────");

	const r6Tenant = await upsertTenant({
		name: "R6",
		slug: "r6",
		ownerId: ownerIdentity.id,
		moduleAccess: ["hris"],
		isPlatform: false,
	});

	// Bind owner identity to the r6 tenant now that the tenant exists.
	await prisma.identity.update({
		where: { id: ownerIdentity.id },
		data: { tenantId: r6Tenant.id },
	});
	console.log(`  ✓ owner identity bound to tenant "${r6Tenant.slug}"`);

	// ── Tier 2: Tenant Admin identity ─────────────────────────────────────
	// A USER promoted by the owner; has curated management permissions.

	console.log("\n── Tenant admin identity ─────────────────────");

	const adminIdentity = await upsertIdentity({
		tenantId: r6Tenant.id,
		firstName: "Tenant",
		lastName: "Admin",
		country: "PH",
		username: "admin",
		email: "admin@r6.com",
		password: "Password@1234!",
		kind: "USER",
	});

	// ── Tier 3: Regular user identity ─────────────────────────────────────
	// A normal member of the tenant with read-only access.

	console.log("\n── Regular user identity ─────────────────────");

	const regularUser = await upsertIdentity({
		tenantId: r6Tenant.id,
		firstName: "Regular",
		lastName: "User",
		country: "PH",
		username: "user",
		email: "user@r6.com",
		password: "Password@1234!",
		kind: "USER",
	});

	// ── Policies (r6 tenant) ──────────────────────────────────────────────

	console.log("\n── Policies (r6) ─────────────────────────────");

	// Full-access wildcards — only stamped on the owner.
	await upsertPolicy({ tenantId: r6Tenant.id, name: "iam:full-access",  description: "Full IAM access",  permissions: ["iam:*:*"]  });
	await upsertPolicy({ tenantId: r6Tenant.id, name: "hris:full-access", description: "Full HRIS access", permissions: ["hris:*:*"] });

	// Granular IAM policies — used to build per-tier access.
	await upsertPolicy({ tenantId: r6Tenant.id, name: "iam:identity:full-access",  description: "Full identity access",         permissions: ["iam:identity:create", "iam:identity:read", "iam:identity:update", "iam:identity:delete", "iam:identity:restore"] });
	await upsertPolicy({ tenantId: r6Tenant.id, name: "iam:identity:manage",       description: "Create/read/update/delete identities", permissions: ["iam:identity:create", "iam:identity:read", "iam:identity:update", "iam:identity:delete"] });
	await upsertPolicy({ tenantId: r6Tenant.id, name: "iam:identity:read-only",    description: "View identities",              permissions: ["iam:identity:read"] });
	await upsertPolicy({ tenantId: r6Tenant.id, name: "iam:invitation:manage",     description: "Send and view invitations",     permissions: ["iam:invitation:create", "iam:invitation:read"] });
	await upsertPolicy({ tenantId: r6Tenant.id, name: "iam:role:full-access",      description: "Full role access",              permissions: ["iam:role:create", "iam:role:read", "iam:role:update", "iam:role:delete", "iam:role:restore"] });
	await upsertPolicy({ tenantId: r6Tenant.id, name: "iam:role:read-only",        description: "View roles",                    permissions: ["iam:role:read"] });
	await upsertPolicy({ tenantId: r6Tenant.id, name: "iam:policy:full-access",    description: "Full policy access",            permissions: ["iam:policy:create", "iam:policy:read", "iam:policy:update", "iam:policy:delete", "iam:policy:restore"] });
	await upsertPolicy({ tenantId: r6Tenant.id, name: "iam:policy:read-only",      description: "View policies",                 permissions: ["iam:policy:read"] });
	await upsertPolicy({ tenantId: r6Tenant.id, name: "iam:tenant:full-access",    description: "Full tenant access",            permissions: ["iam:tenant:create", "iam:tenant:read", "iam:tenant:update", "iam:tenant:delete", "iam:tenant:restore"] });

	// ── Identity permissions ──────────────────────────────────────────────

	// Owner — full access to all modules.
	console.log("\n── Identity permissions (owner) ──────────────");
	await upsertIdentityPermission({ tenantId: r6Tenant.id, identityId: ownerIdentity.id, permission: "iam:*:*",  effect: "ALLOW" });
	await upsertIdentityPermission({ tenantId: r6Tenant.id, identityId: ownerIdentity.id, permission: "hris:*:*", effect: "ALLOW" });

	// Tenant Admin — curated management access (no wildcard).
	console.log("\n── Identity permissions (tenant admin) ───────");
	await upsertIdentityPermission({ tenantId: r6Tenant.id, identityId: adminIdentity.id, permission: "iam:identity:create",     effect: "ALLOW" });
	await upsertIdentityPermission({ tenantId: r6Tenant.id, identityId: adminIdentity.id, permission: "iam:identity:read",       effect: "ALLOW" });
	await upsertIdentityPermission({ tenantId: r6Tenant.id, identityId: adminIdentity.id, permission: "iam:identity:update",     effect: "ALLOW" });
	await upsertIdentityPermission({ tenantId: r6Tenant.id, identityId: adminIdentity.id, permission: "iam:identity:delete",     effect: "ALLOW" });
	await upsertIdentityPermission({ tenantId: r6Tenant.id, identityId: adminIdentity.id, permission: "iam:invitation:create",   effect: "ALLOW" });
	await upsertIdentityPermission({ tenantId: r6Tenant.id, identityId: adminIdentity.id, permission: "iam:invitation:read",     effect: "ALLOW" });
	await upsertIdentityPermission({ tenantId: r6Tenant.id, identityId: adminIdentity.id, permission: "iam:role:read",           effect: "ALLOW" });
	await upsertIdentityPermission({ tenantId: r6Tenant.id, identityId: adminIdentity.id, permission: "iam:policy:read",         effect: "ALLOW" });

	// Regular User — read-only access.
	console.log("\n── Identity permissions (regular user) ───────");
	await upsertIdentityPermission({ tenantId: r6Tenant.id, identityId: regularUser.id, permission: "iam:identity:read", effect: "ALLOW" });
	await upsertIdentityPermission({ tenantId: r6Tenant.id, identityId: regularUser.id, permission: "iam:role:read",     effect: "ALLOW" });
	await upsertIdentityPermission({ tenantId: r6Tenant.id, identityId: regularUser.id, permission: "iam:policy:read",   effect: "ALLOW" });

	console.log("\n── Done ──────────────────────────────────────\n");
	console.log("Tenant: r6");
	console.log("  Owner        (owner)  Password@1234!  [iam:*:*  hris:*:*]");
	console.log("  Tenant Admin (admin)  Password@1234!  [iam:identity:*  iam:invitation:*  iam:role:read  iam:policy:read]");
	console.log("  User         (user)   Password@1234!  [iam:identity:read  iam:role:read  iam:policy:read]");
	console.log();
}

main()
	.catch((err) => {
		console.error(err);
		process.exit(1);
	})
	.finally(() => prisma.$disconnect());

