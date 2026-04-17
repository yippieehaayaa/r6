/**
 * Seed: identity-and-access
 *
 * Destructive — wipes all existing data then re-creates from scratch.
 * Run with: npm run db:seed  (from dbs/identity-and-access/)
 *
 * Seeded identities
 * ┌────────┬────────────────┬───────┬────────────┬──────────────────────────────────────────────────┐
 * │ login  │ password       │ kind  │ tenant     │ resolved permissions                             │
 * ├────────┼────────────────┼───────┼────────────┼──────────────────────────────────────────────────┤
 * │ admin  │ Password@1234! │ ADMIN │ platform   │ iam:*:*  (ADMIN kind — bypasses all guards)      │
 * │ owner  │ Password@1234! │ USER  │ r6         │ iam:*:*  hris:*:*  (via tenant-owner role)       │
 * └────────┴────────────────┴───────┴────────────┴──────────────────────────────────────────────────┘
 *
 * Seeded policies (platform tenant)
 *   iam:admin:full-access     → iam:*:*
 *   iam:identity:full-access  → iam:identity:create/read/update/delete/restore
 *   iam:role:full-access      → iam:role:create/read/update/delete/restore
 *   iam:policy:full-access    → iam:policy:create/read/update/delete/restore
 *   iam:tenant:full-access    → iam:tenant:create/read/update/delete/restore
 *
 * Seeded policies (r6 tenant — IAM)
 *   iam:full-access           → iam:*:*
 *   iam:identity:full-access  → iam:identity:create/read/update/delete/restore
 *   iam:role:full-access      → iam:role:create/read/update/delete/restore
 *   iam:policy:full-access    → iam:policy:create/read/update/delete/restore
 *   iam:tenant:full-access    → iam:tenant:create/read/update/delete/restore
 *
 * Seeded policies (r6 tenant — HRIS)
 *   hris:full-access          → hris:*:*
 *   hris:identity:full-access → hris:identity:create/read/update/delete/restore
 *   hris:role:full-access     → hris:role:create/read/update/delete/restore
 *   hris:policy:full-access   → hris:policy:create/read/update/delete/restore
 *   hris:tenant:full-access   → hris:tenant:create/read/update/delete/restore
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
	await prisma.identity.deleteMany();
	await prisma.policy.deleteMany();
	await prisma.tenant.deleteMany();

	console.log("  ✓ All existing data removed");

	console.log("\n── Platform tenant ───────────────────────────");

	const platformTenant = await upsertTenant({
		name: "Platform",
		slug: "platform",
		moduleAccess: [],
		isPlatform: true,
	});

	console.log("\n── Policies (platform) ───────────────────────");

	const PLATFORM_PERMISSIONS = [
		"iam:*:*",
		"iam:identity:create", "iam:identity:read", "iam:identity:update", "iam:identity:delete", "iam:identity:restore",
		"iam:policy:create",   "iam:policy:read",   "iam:policy:update",   "iam:policy:delete",   "iam:policy:restore",
		"iam:tenant:create",   "iam:tenant:read",   "iam:tenant:update",   "iam:tenant:delete",   "iam:tenant:restore",
	] as const;

	for (const perm of PLATFORM_PERMISSIONS) {
		await upsertPolicy({ tenantId: platformTenant.id, name: perm, description: `Grants ${perm}`, permissions: [perm] });
	}

	console.log("\n── Identities ────────────────────────────────");

	const adminIdentity = await upsertIdentity({
		tenantId: platformTenant.id,
		username: "admin",
		email: "admin@example.com",
		password: "Password@1234!",
		kind: "ADMIN",
	});

	console.log("\n── Identity permissions (admin) ──────────────");

	await upsertIdentityPermission({ tenantId: platformTenant.id, identityId: adminIdentity.id, permission: "iam:*:*", effect: "ALLOW" });

	// ── R6 tenant ────────────────────────────────────────────────────────────

	console.log("\n── R6 tenant ─────────────────────────────────");

	const r6Tenant = await upsertTenant({
		name: "R6",
		slug: "r6",
		moduleAccess: ["hris"],
		isPlatform: false,
	});

	console.log("\n── Policies (r6) ─────────────────────────────");

	const R6_PERMISSIONS = [
		"iam:*:*",
		"iam:identity:create", "iam:identity:read", "iam:identity:update", "iam:identity:delete", "iam:identity:restore",
		"iam:policy:create",   "iam:policy:read",   "iam:policy:update",   "iam:policy:delete",   "iam:policy:restore",
		"iam:tenant:create",   "iam:tenant:read",   "iam:tenant:update",   "iam:tenant:delete",   "iam:tenant:restore",
		"hris:*:*",
		"hris:identity:create", "hris:identity:read", "hris:identity:update", "hris:identity:delete", "hris:identity:restore",
		"hris:policy:create",   "hris:policy:read",   "hris:policy:update",   "hris:policy:delete",   "hris:policy:restore",
		"hris:tenant:create",   "hris:tenant:read",   "hris:tenant:update",   "hris:tenant:delete",   "hris:tenant:restore",
	] as const;

	for (const perm of R6_PERMISSIONS) {
		await upsertPolicy({ tenantId: r6Tenant.id, name: perm, description: `Grants ${perm}`, permissions: [perm] });
	}

	console.log("\n── Identities (r6) ───────────────────────────");

	const ownerIdentity = await upsertIdentity({
		tenantId: r6Tenant.id,
		username: "owner",
		email: "owner@r6.com",
		password: "Password@1234!",
		kind: "USER",
	});

	console.log("\n── Identity permissions (owner) ──────────────");

	await upsertIdentityPermission({ tenantId: r6Tenant.id, identityId: ownerIdentity.id, permission: "iam:*:*", effect: "ALLOW" });
	await upsertIdentityPermission({ tenantId: r6Tenant.id, identityId: ownerIdentity.id, permission: "hris:*:*", effect: "ALLOW" });

	console.log("\n── Done ──────────────────────────────────────\n");
	console.log("Platform admin:  admin  (Password@1234!)  [iam:*:* stamped directly]");
	console.log("R6 tenant owner: owner  (Password@1234!)  [iam:*:*  hris:*:* stamped directly]");
	console.log();
}

main()
	.catch((err) => {
		console.error(err);
		process.exit(1);
	})
	.finally(() => prisma.$disconnect());

