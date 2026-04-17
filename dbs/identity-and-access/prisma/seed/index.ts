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

import { upsertRole, linkPolicyToRole } from "./role.js";
import { upsertIdentity, linkRoleToIdentity } from "./identity.js";
import { upsertPolicy } from "./policy.js";
import { upsertTenant } from "./tenant.js";
import { prisma } from "../../src/client.js";

async function main() {
	console.log("\n── Cleanup ───────────────────────────────────");

	await prisma.refreshToken.deleteMany();
	await prisma.identityRole.deleteMany();
	await prisma.rolePolicy.deleteMany();
	await prisma.identityPermission.deleteMany();
	await prisma.invitation.deleteMany();
	await prisma.identity.deleteMany();
	await prisma.role.deleteMany();
	await prisma.policy.deleteMany();
	await prisma.tenant.deleteMany();

	console.log("  ✓ All existing data removed");

	console.log("\n── Platform tenant ───────────────────────────");

	// The platform tenant owns all ADMIN identities and platform-level
	// roles/policies. tenantId is non-nullable on Identity — ADMIN
	// identities belong here instead of having tenantId = null.
	const platformTenant = await upsertTenant({
		name: "Platform",
		slug: "platform",
		moduleAccess: [],
		isPlatform: true,
	});

	console.log("\n── Policies ──────────────────────────────────");

	const adminPolicy = await upsertPolicy({
		tenantId: platformTenant.id,
		name: "iam:admin:full-access",
		description: "Grants full access to all IAM resources and actions",
		permissions: ["iam:*:*"],
	});

	const identityCrudPolicy = await upsertPolicy({
		tenantId: platformTenant.id,
		name: "iam:identity:full-access",
		description: "Full CRUD access to identities",
		permissions: [
			"iam:identity:create",
			"iam:identity:read",
			"iam:identity:update",
			"iam:identity:delete",
			"iam:identity:restore",
		],
	});

	const roleCrudPolicy = await upsertPolicy({
		tenantId: platformTenant.id,
		name: "iam:role:full-access",
		description: "Full CRUD access to roles",
		permissions: [
			"iam:role:create",
			"iam:role:read",
			"iam:role:update",
			"iam:role:delete",
			"iam:role:restore",
		],
	});

	const policyCrudPolicy = await upsertPolicy({
		tenantId: platformTenant.id,
		name: "iam:policy:full-access",
		description: "Full CRUD access to policies",
		permissions: [
			"iam:policy:create",
			"iam:policy:read",
			"iam:policy:update",
			"iam:policy:delete",
			"iam:policy:restore",
		],
	});

	const tenantCrudPolicy = await upsertPolicy({
		tenantId: platformTenant.id,
		name: "iam:tenant:full-access",
		description: "Full CRUD access to tenants",
		permissions: [
			"iam:tenant:create",
			"iam:tenant:read",
			"iam:tenant:update",
			"iam:tenant:delete",
			"iam:tenant:restore",
		],
	});

	console.log("\n── Roles ─────────────────────────────────────");

	const adminRole = await upsertRole(
		"admin",
		"Full IAM administration access",
		platformTenant.id,
	);

	console.log("\n── Role → Policy assignments ─────────────────");

	await linkPolicyToRole(adminRole.id, adminPolicy.id, "admin → iam:admin:full-access");
	await linkPolicyToRole(adminRole.id, identityCrudPolicy.id, "admin → iam:identity:full-access");
	await linkPolicyToRole(adminRole.id, roleCrudPolicy.id, "admin → iam:role:full-access");
	await linkPolicyToRole(adminRole.id, policyCrudPolicy.id, "admin → iam:policy:full-access");
	await linkPolicyToRole(adminRole.id, tenantCrudPolicy.id, "admin → iam:tenant:full-access");

	console.log("\n── Identities ────────────────────────────────");

	const adminIdentity = await upsertIdentity({
		tenantId: platformTenant.id,
		username: "admin",
		email: "admin@example.com",
		password: "Password@1234!",
		kind: "ADMIN",
	});

	console.log("\n── Identity → Role assignments ───────────────");

	await linkRoleToIdentity(adminRole.id, adminIdentity.id, "admin → role:admin");

	// ── R6 tenant ────────────────────────────────────────────────────────────

	console.log("\n── R6 tenant ─────────────────────────────────");

	const r6Tenant = await upsertTenant({
		name: "R6",
		slug: "r6",
		moduleAccess: ["hris"],
		isPlatform: false,
	});

	console.log("\n── Policies (r6 — IAM) ───────────────────────");

	const r6IamFullPolicy = await upsertPolicy({
		tenantId: r6Tenant.id,
		name: "iam:full-access",
		description: "Full access to all IAM resources and actions",
		permissions: ["iam:*:*"],
	});

	await upsertPolicy({
		tenantId: r6Tenant.id,
		name: "iam:identity:full-access",
		description: "Full CRUD access to identities",
		permissions: [
			"iam:identity:create",
			"iam:identity:read",
			"iam:identity:update",
			"iam:identity:delete",
			"iam:identity:restore",
		],
	});

	await upsertPolicy({
		tenantId: r6Tenant.id,
		name: "iam:role:full-access",
		description: "Full CRUD access to roles",
		permissions: [
			"iam:role:create",
			"iam:role:read",
			"iam:role:update",
			"iam:role:delete",
			"iam:role:restore",
		],
	});

	await upsertPolicy({
		tenantId: r6Tenant.id,
		name: "iam:policy:full-access",
		description: "Full CRUD access to policies",
		permissions: [
			"iam:policy:create",
			"iam:policy:read",
			"iam:policy:update",
			"iam:policy:delete",
			"iam:policy:restore",
		],
	});

	await upsertPolicy({
		tenantId: r6Tenant.id,
		name: "iam:tenant:full-access",
		description: "Full CRUD access to tenants",
		permissions: [
			"iam:tenant:create",
			"iam:tenant:read",
			"iam:tenant:update",
			"iam:tenant:delete",
			"iam:tenant:restore",
		],
	});

	console.log("\n── Policies (r6 — HRIS) ──────────────────────");

	const r6HrisFullPolicy = await upsertPolicy({
		tenantId: r6Tenant.id,
		name: "hris:full-access",
		description: "Full access to all HRIS resources and actions",
		permissions: ["hris:*:*"],
	});

	await upsertPolicy({
		tenantId: r6Tenant.id,
		name: "hris:identity:full-access",
		description: "Full CRUD access to HRIS identities",
		permissions: [
			"hris:identity:create",
			"hris:identity:read",
			"hris:identity:update",
			"hris:identity:delete",
			"hris:identity:restore",
		],
	});

	await upsertPolicy({
		tenantId: r6Tenant.id,
		name: "hris:role:full-access",
		description: "Full CRUD access to HRIS roles",
		permissions: [
			"hris:role:create",
			"hris:role:read",
			"hris:role:update",
			"hris:role:delete",
			"hris:role:restore",
		],
	});

	await upsertPolicy({
		tenantId: r6Tenant.id,
		name: "hris:policy:full-access",
		description: "Full CRUD access to HRIS policies",
		permissions: [
			"hris:policy:create",
			"hris:policy:read",
			"hris:policy:update",
			"hris:policy:delete",
			"hris:policy:restore",
		],
	});

	await upsertPolicy({
		tenantId: r6Tenant.id,
		name: "hris:tenant:full-access",
		description: "Full CRUD access to HRIS tenants",
		permissions: [
			"hris:tenant:create",
			"hris:tenant:read",
			"hris:tenant:update",
			"hris:tenant:delete",
			"hris:tenant:restore",
		],
	});

	console.log("\n── Roles (r6) ────────────────────────────────");

	const tenantOwnerRole = await upsertRole(
		"tenant-owner",
		"Full access to all modules",
		r6Tenant.id,
	);

	console.log("\n── Role → Policy assignments (r6) ───────────");

	await linkPolicyToRole(tenantOwnerRole.id, r6IamFullPolicy.id, "tenant-owner → iam:full-access");
	await linkPolicyToRole(tenantOwnerRole.id, r6HrisFullPolicy.id, "tenant-owner → hris:full-access");

	console.log("\n── Identities (r6) ───────────────────────────");

	const ownerIdentity = await upsertIdentity({
		tenantId: r6Tenant.id,
		username: "owner",
		email: "owner@r6.com",
		password: "Password@1234!",
		kind: "USER",
	});

	console.log("\n── Identity → Role assignments (r6) ──────────");

	await linkRoleToIdentity(tenantOwnerRole.id, ownerIdentity.id, "owner → role:tenant-owner");

	console.log("\n── Done ──────────────────────────────────────\n");
	console.log("Platform admin:  admin  (Password@1234!)  [ADMIN bypass — all IAM sections]");
	console.log("R6 tenant owner: owner  (Password@1234!)  [iam:*:*  hris:*:*]");
	console.log();
}

main()
	.catch((err) => {
		console.error(err);
		process.exit(1);
	})
	.finally(() => prisma.$disconnect());

