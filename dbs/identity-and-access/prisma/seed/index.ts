/**
 * Seed: identity-and-access
 *
 * Idempotent — safe to run multiple times. Existing records are skipped.
 * Run with: pnpm db:seed  (from dbs/identity-and-access/)
 *
 * Permission format: {service}:{resource}:{action}
 *   service  → iam
 *   resource → identity | session | role | policy | tenant
 *   action   → read | create | update | delete | list | * (wildcard)
 *
 * Hierarchy: Tenant → Identity → Role → Policy → permissions[]
 *
 * tenantId = null  → platform-level (ADMIN identities, platform roles/policies)
 * tenantId = uuid  → tenant-scoped  (USER identities, tenant roles/policies)
 *
 * Seeded identities
 * ┌──────────────────┬──────────────────┬─────────┬────────────┬──────────────────────────────────────────────────────────┐
 * │ login            │ password         │ kind    │ tenant     │ resolved permissions                                     │
 * ├──────────────────┼──────────────────┼─────────┼────────────┼──────────────────────────────────────────────────────────┤
 * │ admin            │ Admin@1234!      │ ADMIN   │ (none)     │ iam:*:*  (ADMIN kind — bypasses all permission guards)   │
 * │ iam-manager      │ Manager@1234!    │ USER    │ demo-corp  │ iam:identity:r/c/u/d  iam:role:r/c/u/d  iam:policy:read │
 * │ iam-viewer       │ Viewer@1234!     │ USER    │ demo-corp  │ iam:identity:read  iam:role:read  iam:policy:read        │
 * │ identity-manager │ Identity@1234!   │ USER    │ demo-corp  │ iam:identity:read/create/update/delete                  │
 * │ testuser         │ User@1234!       │ USER    │ demo-corp  │ iam:identity:r/c/list  iam:role:read  iam:session:*     │
 * └──────────────────┴──────────────────┴─────────┴────────────┴──────────────────────────────────────────────────────────┘
 *
 * Sidebar visibility matrix (apps/r6-app sidebar-data):
 * ┌──────────────────┬────────────┬───────┬──────────┬──────────────────────────────────────────────────────┐
 * │ identity         │ Identities │ Roles │ Policies │ Tenants                                              │
 * ├──────────────────┼────────────┼───────┼──────────┼──────────────────────────────────────────────────────┤
 * │ admin            │ ✓          │ ✓     │ ✓        │ ✓  (adminOnly flag — kind=ADMIN, not permission)     │
 * │ iam-manager      │ ✓          │ ✓     │ ✓        │ ✗                                                    │
 * │ iam-viewer       │ ✓          │ ✓     │ ✓        │ ✗                                                    │
 * │ identity-manager │ ✓          │ ✗     │ ✗        │ ✗                                                    │
 * │ testuser         │ ✓          │ ✓     │ ✗        │ ✗                                                    │
 * └──────────────────┴────────────┴───────┴──────────┴──────────────────────────────────────────────────────┘
 *
 * Policy visibility rule: audience ⊆ tenant.moduleAccess (strict subset).
 *   All policies are platform-level (tenantId = null), audience ["iam"].
 *   demo-corp moduleAccess ["iam"] → all IAM policies visible to its users.
 *   Tenant management is ADMIN-only (adminOnly sidebar flag + requireAdmin() routes).
 */

import { prisma } from "../../src/client.js";
import { upsertIdentity, linkRoleToIdentity } from "./identity.js";
import { upsertPolicy } from "./policy.js";
import { upsertRole, linkPolicyToRole } from "./role.js";
import { upsertTenant } from "./tenant.js";

async function main() {
	console.log("\n── Tenants ───────────────────────────────────");

	const demoTenant = await upsertTenant({
		name: "Demo Corp",
		slug: "demo-corp",
		moduleAccess: ["iam"],
	});

	console.log("\n── Policies ──────────────────────────────────");

	// ── Platform-level (tenantId: null) ──────────────────────────────────────

	const adminPolicy = await upsertPolicy({
		tenantId: null,
		name: "iam:admin:full-access",
		description: "Grants full access to all IAM resources and actions",
		effect: "ALLOW",
		permissions: ["iam:*:*"],
		audience: ["iam"],
	});

	// ── Tenant-scoped: existing user policies ────────────────────────────────

	const userIdentityPolicy = await upsertPolicy({
		tenantId: null,
		name: "iam:user:identity",
		description: "Read own identity",
		effect: "ALLOW",
		permissions: ["iam:identity:read"],
		audience: ["iam"],
	});

	const userSessionPolicy = await upsertPolicy({
		tenantId: null,
		name: "iam:user:session",
		description: "Manage own sessions (login, refresh, logout)",
		effect: "ALLOW",
		permissions: [
			"iam:session:read",
			"iam:session:write",
			"iam:session:delete",
		],
		audience: ["iam"],
	});

	const tenantOwnerIdentityPolicy = await upsertPolicy({
		tenantId: null,
		name: "iam:tenant-owner:identity-management",
		description:
			"Allows tenant owners to create, read, and list identities within their own tenant",
		effect: "ALLOW",
		permissions: [
			"iam:identity:create",
			"iam:identity:read",
			"iam:identity:list",
		],
		audience: ["iam"],
	});

	// ── Tenant-scoped: granular resource policies ─────────────────────────────

	const identityFullAccessPolicy = await upsertPolicy({
		tenantId: null,
		name: "iam:identity:full-access",
		description: "Full CRUD access to identities",
		effect: "ALLOW",
		permissions: [
			"iam:identity:read",
			"iam:identity:create",
			"iam:identity:update",
			"iam:identity:delete",
		],
		audience: ["iam"],
	});

	const roleFullAccessPolicy = await upsertPolicy({
		tenantId: null,
		name: "iam:role:full-access",
		description: "Full CRUD access to roles",
		effect: "ALLOW",
		permissions: [
			"iam:role:read",
			"iam:role:create",
			"iam:role:update",
			"iam:role:delete",
		],
		audience: ["iam"],
	});

	const policyReadPolicy = await upsertPolicy({
		tenantId: null,
		name: "iam:policy:read-only",
		description: "Read-only access to policies (writes are ADMIN-only at the API level)",
		effect: "ALLOW",
		permissions: ["iam:policy:read"],
		audience: ["iam"],
	});

	// NOTE: iam:tenant:read-only is intentionally omitted.
	// Tenant management is ADMIN-only — the Tenants sidebar item uses adminOnly,
	// not a permission string. No tenant-scoped role receives iam:tenant:read.

	const iamReadOnlyPolicy = await upsertPolicy({
		tenantId: null,
		name: "iam:read-only",
		description:
			"Read-only access to IAM resources visible to tenants (identities, roles, policies)",
		effect: "ALLOW",
		permissions: [
			"iam:identity:read",
			"iam:role:read",
			"iam:policy:read",
		],
		audience: ["iam"],
	});

	const roleReadOnlyPolicy = await upsertPolicy({
		tenantId: null,
		name: "iam:role:read-only",
		description: "Read-only access to roles",
		effect: "ALLOW",
		permissions: ["iam:role:read"],
		audience: ["iam"],
	});

	console.log("\n── Roles ─────────────────────────────────────");

	// ── Platform-level ────────────────────────────────────────────────────────

	const adminRole = await upsertRole(
		"admin",
		"Full IAM administration access",
		null,
	);

	// ── Tenant-scoped: existing ───────────────────────────────────────────────

	const userRole = await upsertRole(
		"user",
		"Standard self-service user access",
		demoTenant.id,
	);

	const tenantOwnerRole = await upsertRole(
		"tenant-owner",
		"Tenant owner — can manage identities within their own tenant",
		demoTenant.id,
	);

	// ── Tenant-scoped: new ────────────────────────────────────────────────────

	const iamManagerRole = await upsertRole(
		"iam-manager",
		"Full IAM management: identities, roles, policies, and tenant read",
		demoTenant.id,
	);

	const iamViewerRole = await upsertRole(
		"iam-viewer",
		"Read-only access to all IAM resources",
		demoTenant.id,
	);

	const identityManagerRole = await upsertRole(
		"identity-manager",
		"Full CRUD access to identities only",
		demoTenant.id,
	);

	const roleViewerRole = await upsertRole(
		"role-viewer",
		"Read-only access to roles",
		demoTenant.id,
	);

	console.log("\n── Role → Policy assignments ─────────────────");

	// admin
	await linkPolicyToRole(
		adminRole.id,
		adminPolicy.id,
		"admin → iam:admin:full-access",
	);

	// user (existing)
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

	// tenant-owner (existing)
	await linkPolicyToRole(
		tenantOwnerRole.id,
		tenantOwnerIdentityPolicy.id,
		"tenant-owner → iam:tenant-owner:identity-management",
	);

	// iam-manager: full CRUD on identity + role, plus policy read
	// (Tenant management is ADMIN-only — no iam:tenant:read assigned)
	await linkPolicyToRole(
		iamManagerRole.id,
		identityFullAccessPolicy.id,
		"iam-manager → iam:identity:full-access",
	);
	await linkPolicyToRole(
		iamManagerRole.id,
		roleFullAccessPolicy.id,
		"iam-manager → iam:role:full-access",
	);
	await linkPolicyToRole(
		iamManagerRole.id,
		policyReadPolicy.id,
		"iam-manager → iam:policy:read-only",
	);

	// iam-viewer: read-only across all IAM resources
	await linkPolicyToRole(
		iamViewerRole.id,
		iamReadOnlyPolicy.id,
		"iam-viewer → iam:read-only",
	);

	// identity-manager: identity CRUD only
	await linkPolicyToRole(
		identityManagerRole.id,
		identityFullAccessPolicy.id,
		"identity-manager → iam:identity:full-access",
	);

	// role-viewer: role read only
	await linkPolicyToRole(
		roleViewerRole.id,
		roleReadOnlyPolicy.id,
		"role-viewer → iam:role:read-only",
	);

	console.log("\n── Identities ────────────────────────────────");

	const adminIdentity = await upsertIdentity({
		tenantId: null,
		username: "admin",
		email: "admin@example.com",
		password: "Admin@1234!",
		kind: "ADMIN",
	});

	const testUser = await upsertIdentity({
		tenantId: demoTenant.id,
		username: "testuser",
		email: "testuser@example.com",
		password: "User@1234!",
		kind: "USER",
	});

	const iamManagerUser = await upsertIdentity({
		tenantId: demoTenant.id,
		username: "iam-manager",
		email: "iam-manager@example.com",
		password: "Manager@1234!",
		kind: "USER",
	});

	const iamViewerUser = await upsertIdentity({
		tenantId: demoTenant.id,
		username: "iam-viewer",
		email: "iam-viewer@example.com",
		password: "Viewer@1234!",
		kind: "USER",
	});

	const identityManagerUser = await upsertIdentity({
		tenantId: demoTenant.id,
		username: "identity-manager",
		email: "identity-manager@example.com",
		password: "Identity@1234!",
		kind: "USER",
	});

	console.log("\n── Identity → Role assignments ───────────────");

	// admin
	await linkRoleToIdentity(
		adminRole.id,
		adminIdentity.id,
		"admin → role:admin",
	);

	// testuser: existing roles + new role-viewer (Identities ✓, Roles ✓, Policies ✗, Tenants ✗)
	await linkRoleToIdentity(userRole.id, testUser.id, "testuser → role:user");
	await linkRoleToIdentity(
		tenantOwnerRole.id,
		testUser.id,
		"testuser → role:tenant-owner",
	);
	await linkRoleToIdentity(
		roleViewerRole.id,
		testUser.id,
		"testuser → role:role-viewer",
	);

	// dedicated identities
	await linkRoleToIdentity(
		iamManagerRole.id,
		iamManagerUser.id,
		"iam-manager → role:iam-manager",
	);
	await linkRoleToIdentity(
		iamViewerRole.id,
		iamViewerUser.id,
		"iam-viewer → role:iam-viewer",
	);
	await linkRoleToIdentity(
		identityManagerRole.id,
		identityManagerUser.id,
		"identity-manager → role:identity-manager",
	);

	console.log("\n── Done ──────────────────────────────────────\n");
	console.log("Test credentials and sidebar access:");
	console.log(
		"  admin             (Admin@1234!)    → all IAM sections  [ADMIN bypass]",
	);
	console.log(
		"  iam-manager       (Manager@1234!)  → Identities+Roles+Policies (write) — no Tenants",
	);
	console.log(
		"  iam-viewer        (Viewer@1234!)   → Identities+Roles+Policies (read)  — no Tenants",
	);
	console.log(
		"  identity-manager  (Identity@1234!) → Identities only   + write",
	);
	console.log(
		"  testuser          (User@1234!)     → Identities + Roles only",
	);
	console.log();
	console.log(
		"Login format: username@tenant-slug  (e.g. iam-manager@demo-corp)",
	);
	console.log("Admin login:  username only         (e.g. admin)");
	console.log();
}

main()
	.catch((err) => {
		console.error(err);
		process.exit(1);
	})
	.finally(() => prisma.$disconnect());

