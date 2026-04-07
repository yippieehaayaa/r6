/**
 * Seed: identity-and-access
 *
 * Destructive — wipes all existing data then re-creates from scratch.
 * Run with: pnpm db:seed  (from dbs/identity-and-access/)
 *
 * Seeded identities
 * ┌───────┬────────────────┬───────┬────────┬──────────────────────────────────────────────┐
 * │ login │ password       │ kind  │ tenant │ resolved permissions                         │
 * ├───────┼────────────────┼───────┼────────┼──────────────────────────────────────────────┤
 * │ admin │ Password@1234! │ ADMIN │ (none) │ iam:*:*  (ADMIN kind — bypasses all guards)  │
 * └───────┴────────────────┴───────┴────────┴──────────────────────────────────────────────┘
 *
 * Seeded policies (platform-level, tenantId = null, audience ["iam"])
 *   iam:admin:full-access      → iam:*:*
 *   iam:identity:full-access  → iam:identity:read/create/update/delete/restore
 *   iam:role:full-access      → iam:role:read/create/update/delete/restore
 *   iam:policy:full-access    → iam:policy:read/create/update/delete/restore
 *   iam:policy:read-only      → iam:policy:read
 */

import { upsertRole, linkPolicyToRole } from "./role.js";
import { upsertIdentity, linkRoleToIdentity } from "./identity.js";
import { upsertPolicy } from "./policy.js";
import { prisma } from "../../src/client.js";

async function main() {
	console.log("\n── Cleanup ───────────────────────────────────");

	await prisma.refreshToken.deleteMany();
	await prisma.$executeRaw`DELETE FROM "_IdentityToRole"`;
	await prisma.$executeRaw`DELETE FROM "_PolicyToRole"`;
	await prisma.identity.deleteMany();
	await prisma.role.deleteMany();
	await prisma.policy.deleteMany();
	await prisma.tenant.deleteMany();

	console.log("  ✓ All existing data removed");

	console.log("\n── Policies ──────────────────────────────────");

	const adminPolicy = await upsertPolicy({
		tenantId: null,
		name: "iam:admin:full-access",
		description: "Grants full access to all IAM resources and actions",
		effect: "ALLOW",
		permissions: ["iam:*:*"],
		audience: ["iam"],
	});

	const identityCrudPolicy = await upsertPolicy({
		tenantId: null,
		name: "iam:identity:full-access",
		description: "Full CRUD access to identities",
		effect: "ALLOW",
		permissions: [
			"iam:identity:read",
			"iam:identity:create",
			"iam:identity:update",
			"iam:identity:delete",
			"iam:identity:restore",
		],
		audience: ["iam"],
	});

	const roleCrudPolicy = await upsertPolicy({
		tenantId: null,
		name: "iam:role:full-access",
		description: "Full CRUD access to roles",
		effect: "ALLOW",
		permissions: [
			"iam:role:read",
			"iam:role:create",
			"iam:role:update",
			"iam:role:delete",
			"iam:role:restore",
		],
		audience: ["iam"],
	});

	const policyCrudPolicy = await upsertPolicy({
		tenantId: null,
		name: "iam:policy:full-access",
		description: "Full CRUD access to policies",
		effect: "ALLOW",
		permissions: [
			"iam:policy:read",
			"iam:policy:create",
			"iam:policy:update",
			"iam:policy:delete",
			"iam:policy:restore",
		],
		audience: ["iam"],
	});

	const policyReadOnlyPolicy = await upsertPolicy({
		tenantId: null,
		name: "iam:policy:read-only",
		description: "Read-only access to policies",
		effect: "ALLOW",
		permissions: ["iam:policy:read"],
		audience: ["iam"],
	});

	console.log("\n── Roles ─────────────────────────────────────");

	const adminRole = await upsertRole(
		"admin",
		"Full IAM administration access",
		null,
	);

	console.log("\n── Role → Policy assignments ─────────────────");

	await linkPolicyToRole(adminRole.id, adminPolicy.id, "admin → iam:admin:full-access");
	await linkPolicyToRole(adminRole.id, identityCrudPolicy.id, "admin → iam:identity:full-access");
	await linkPolicyToRole(adminRole.id, roleCrudPolicy.id, "admin → iam:role:full-access");
	await linkPolicyToRole(adminRole.id, policyCrudPolicy.id, "admin → iam:policy:full-access");

	console.log("\n── Identities ────────────────────────────────");

	const adminIdentity = await upsertIdentity({
		tenantId: null,
		username: "admin",
		email: "admin@example.com",
		password: "Password@1234!",
		kind: "ADMIN",
	});

	console.log("\n── Identity → Role assignments ───────────────");

	await linkRoleToIdentity(adminRole.id, adminIdentity.id, "admin → role:admin");

	console.log("\n── Done ──────────────────────────────────────\n");
	console.log("Admin login: admin  (Password@1234!)  [ADMIN bypass — all IAM sections]");
	console.log();
}

main()
	.catch((err) => {
		console.error(err);
		process.exit(1);
	})
	.finally(() => prisma.$disconnect());
