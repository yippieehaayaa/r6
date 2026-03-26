/**
 * Seed: identity-and-access
 *
 * Idempotent — safe to run multiple times. Existing records are skipped.
 * Run with: pnpm db:seed  (from dbs/identity-and-access/)
 *
 * Permission format: {service}:{resource}:{action}
 *   service  → iam
 *   resource → identity | session | otp | role | policy | tenant
 *   action   → read | write | delete | list | * (wildcard)
 *
 * Hierarchy: Tenant → Identity → Role → Policy → permissions[]
 *
 * tenantId = null  → platform-level (ADMIN identities, platform roles/policies)
 * tenantId = uuid  → tenant-scoped  (USER identities, tenant roles/policies)
 *
 * Seeded identities:
 * ┌────────────┬──────────────┬─────────┬────────────┬──────────────────────────────────────┐
 * │ username   │ password     │ kind    │ tenant     │ permissions                          │
 * ├────────────┼──────────────┼─────────┼────────────┼──────────────────────────────────────┤
 * │ admin      │ Admin@1234!  │ ADMIN   │ (none)     │ iam:*:*  (role: admin)               │
 * │ testuser   │ User@1234!   │ USER    │ demo-corp  │ iam:identity:read, iam:session:*,    │
 * │            │              │         │            │ iam:otp:read/write  (role: user)     │
 * └────────────┴──────────────┴─────────┴────────────┴──────────────────────────────────────┘
 */

import { prisma } from "../../src/client.js";
import { upsertIdentity, linkRoleToIdentity } from "./identity.js";
import { upsertPolicy } from "./policy.js";
import { upsertRole, linkPolicyToRole } from "./role.js";
import { upsertTenant } from "./tenant.js";

async function main() {
	console.log("\n── Tenants ───────────────────────────────────");

	// Platform-level ADMIN identities have tenantId = null.
	// All USER identities must belong to a tenant — create one for seeding.
	const demoTenant = await upsertTenant({
		name: "Demo Corp",
		slug: "demo-corp",
		moduleAccess: ["iam"],
	});

	console.log("\n── Policies ──────────────────────────────────");

	// Platform-level policy (tenantId = null) — attached to the admin role only.
	const adminPolicy = await upsertPolicy({
		tenantId: null,
		name: "iam:admin:full-access",
		description: "Grants full access to all IAM resources and actions",
		effect: "ALLOW",
		permissions: ["iam:*:*"],
		audience: ["iam-api"],
	});

	// Tenant-scoped policies — attached to the user role for demo-corp.
	const userIdentityPolicy = await upsertPolicy({
		tenantId: demoTenant.id,
		name: "iam:user:identity",
		description: "Read own identity",
		effect: "ALLOW",
		permissions: ["iam:identity:read"],
		audience: ["iam-api"],
	});

	const userSessionPolicy = await upsertPolicy({
		tenantId: demoTenant.id,
		name: "iam:user:session",
		description: "Manage own sessions (login, refresh, logout)",
		effect: "ALLOW",
		permissions: [
			"iam:session:read",
			"iam:session:write",
			"iam:session:delete",
		],
		audience: ["iam-api"],
	});

	const userOtpPolicy = await upsertPolicy({
		tenantId: demoTenant.id,
		name: "iam:user:otp",
		description: "Request and verify OTPs",
		effect: "ALLOW",
		permissions: ["iam:otp:read", "iam:otp:write"],
		audience: ["iam-api"],
	});

	console.log("\n── Roles ─────────────────────────────────────");

	// Platform-level role (tenantId = null) — for ADMIN identities only.
	const adminRole = await upsertRole(
		"admin",
		"Full IAM administration access",
		null,
	);

	// Tenant-scoped role for demo-corp USER identities.
	const userRole = await upsertRole(
		"user",
		"Standard self-service user access",
		demoTenant.id,
	);

	console.log("\n── Role → Policy assignments ─────────────────");

	await linkPolicyToRole(
		adminRole.id,
		adminPolicy.id,
		"admin → iam:admin:full-access",
	);
	await linkPolicyToRole(
		userRole.id,
		userIdentityPolicy.id,
		"user → iam:user:identity",
	);
	await linkPolicyToRole(
		userRole.id,
		userSessionPolicy.id,
		"user → iam:user:session",
	);
	await linkPolicyToRole(userRole.id, userOtpPolicy.id, "user → iam:user:otp");

	console.log("\n── Identities ────────────────────────────────");

	// ADMIN identity — tenantId = null (platform-level).
	const adminIdentity = await upsertIdentity({
		tenantId: null,
		username: "admin",
		email: "admin@example.com",
		password: "Admin@1234!",
		kind: "ADMIN",
	});

	// USER identity — scoped to demo-corp.
	const testUser = await upsertIdentity({
		tenantId: demoTenant.id,
		username: "testuser",
		email: "testuser@example.com",
		password: "User@1234!",
		kind: "USER",
	});

	console.log("\n── Identity → Role assignments ───────────────");

	await linkRoleToIdentity(
		adminRole.id,
		adminIdentity.id,
		"admin → role:admin",
	);
	await linkRoleToIdentity(userRole.id, testUser.id, "testuser → role:user");

	console.log("\n── Done ──────────────────────────────────────\n");
	console.log("Test credentials & resolved permissions:");
	console.log("  admin    → iam:*:*  (role:admin → iam:admin:full-access)");
	console.log(
		"  testuser → iam:identity:read, iam:session:read/write/delete, iam:otp:read/write  (role:user, tenant:demo-corp)",
	);
	console.log();
}

main()
	.catch((err) => {
		console.error(err);
		process.exit(1);
	})
	.finally(() => prisma.$disconnect());

