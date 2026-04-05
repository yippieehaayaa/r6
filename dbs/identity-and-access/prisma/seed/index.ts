/**
 * Seed: identity-and-access
 *
 * Destructive — wipes all existing data then re-creates from scratch.
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
 * ┌──────────────────────┬──────────────────┬─────────┬─────────────┬──────────────────────────────────────────────────────────┐
 * │ login                │ password         │ kind    │ tenant      │ resolved permissions                                     │
 * ├──────────────────────┼──────────────────┼─────────┼─────────────┼──────────────────────────────────────────────────────────┤
 * │ admin                │ Password@1234!   │ ADMIN   │ (none)      │ iam:*:*  (ADMIN kind — bypasses all permission guards)   │
 * ├──────────────────────┼──────────────────┼─────────┼─────────────┼──────────────────────────────────────────────────────────┤
 * │ iam-manager          │ Password@1234!   │ USER    │ demo-corp   │ iam:identity:r/c/u/d  iam:role:r/c/u/d  iam:policy:read │
 * │ iam-viewer           │ Password@1234!   │ USER    │ demo-corp   │ iam:identity:read  iam:role:read  iam:policy:read        │
 * │ identity-manager     │ Password@1234!   │ USER    │ demo-corp   │ iam:identity:read/create/update/delete                  │
 * │ testuser             │ Password@1234!   │ USER    │ demo-corp   │ iam:identity:r/c/list  iam:role:read  iam:session:*     │
 * ├──────────────────────┼──────────────────┼─────────┼─────────────┼──────────────────────────────────────────────────────────┤
 * │ acme-admin           │ Password@1234!   │ USER    │ acme-inc    │ iam:identity:r/c/u/d  iam:role:r/c/u/d  iam:policy:read │
 * │ acme-auditor         │ Password@1234!   │ USER    │ acme-inc    │ iam:identity:read  iam:role:read  iam:policy:read        │
 * │ acme-hr              │ Password@1234!   │ USER    │ acme-inc    │ iam:identity:read/create/update/delete                  │
 * │ acme-dev             │ Password@1234!   │ USER    │ acme-inc    │ iam:identity:read  iam:session:read/write/delete        │
 * ├──────────────────────┼──────────────────┼─────────┼─────────────┼──────────────────────────────────────────────────────────┤
 * │ xyz-founder          │ Password@1234!   │ USER    │ startup-xyz │ iam:identity:create/read/list                           │
 * │ xyz-devops           │ Password@1234!   │ USER    │ startup-xyz │ iam:identity:read  iam:role:read  iam:policy:read        │
 * │ xyz-employee         │ Password@1234!   │ USER    │ startup-xyz │ iam:identity:read  iam:session:read/write/delete        │
 * └──────────────────────┴──────────────────┴─────────┴─────────────┴──────────────────────────────────────────────────────────┘
 *
 * Sidebar visibility matrix (apps/r6-app sidebar-data):
 * ┌──────────────────────┬────────────┬───────┬──────────┬──────────────────────────────────────────────────────┐
 * │ identity             │ Identities │ Roles │ Policies │ Tenants                                              │
 * ├──────────────────────┼────────────┼───────┼──────────┼──────────────────────────────────────────────────────┤
 * │ admin                │ ✓          │ ✓     │ ✓        │ ✓  (adminOnly flag — kind=ADMIN, not permission)     │
 * ├──────────────────────┼────────────┼───────┼──────────┼──────────────────────────────────────────────────────┤
 * │ iam-manager          │ ✓          │ ✓     │ ✓        │ ✗                                                    │
 * │ iam-viewer           │ ✓          │ ✓     │ ✓        │ ✗                                                    │
 * │ identity-manager     │ ✓          │ ✗     │ ✗        │ ✗                                                    │
 * │ testuser             │ ✓          │ ✓     │ ✗        │ ✗                                                    │
 * ├──────────────────────┼────────────┼───────┼──────────┼──────────────────────────────────────────────────────┤
 * │ acme-admin           │ ✓          │ ✓     │ ✓        │ ✗                                                    │
 * │ acme-auditor         │ ✓          │ ✓     │ ✓        │ ✗                                                    │
 * │ acme-hr              │ ✓          │ ✗     │ ✗        │ ✗                                                    │
 * │ acme-dev             │ ✓          │ ✗     │ ✗        │ ✗                                                    │
 * ├──────────────────────┼────────────┼───────┼──────────┼──────────────────────────────────────────────────────┤
 * │ xyz-founder          │ ✓          │ ✗     │ ✗        │ ✗                                                    │
 * │ xyz-devops           │ ✓          │ ✓     │ ✓        │ ✗                                                    │
 * │ xyz-employee         │ ✓          │ ✗     │ ✗        │ ✗                                                    │
 * └──────────────────────┴────────────┴───────┴──────────┴──────────────────────────────────────────────────────┘
 *
 * Policy visibility rule: audience ⊆ tenant.moduleAccess (strict subset).
 *   All policies are platform-level (tenantId = null), audience ["iam"].
 *   demo-corp / startup-xyz moduleAccess ["iam"]       → all IAM policies visible to their users.
 *   acme-inc moduleAccess ["iam", "inventory"]         → all IAM policies visible to its users.
 *   Tenant management is ADMIN-only (adminOnly sidebar flag + requireAdmin() routes).
 */

import { upsertRole, linkPolicyToRole } from "./role.js";
import { upsertIdentity, linkRoleToIdentity } from "./identity.js";
import { upsertPolicy } from "./policy.js";
import { upsertTenant } from "./tenant.js";
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

	console.log("\n── Tenants ───────────────────────────────────");

	const demoTenant = await upsertTenant({
		name: "Demo Corp",
		slug: "demo-corp",
		moduleAccess: ["iam"],
	});

	const acmeTenant = await upsertTenant({
		name: "Acme Inc",
		slug: "acme-inc",
		moduleAccess: ["iam", "inventory"],
	});

	const startupTenant = await upsertTenant({
		name: "Startup XYZ",
		slug: "startup-xyz",
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

	// ── demo-corp ─────────────────────────────────────────────────────────────

	const demoUserRole = await upsertRole(
		"user",
		"Standard self-service user access",
		demoTenant.id,
	);

	const demoTenantOwnerRole = await upsertRole(
		"tenant-owner",
		"Tenant owner — can manage identities within their own tenant",
		demoTenant.id,
	);

	const demoIamManagerRole = await upsertRole(
		"iam-manager",
		"Full IAM management: identities, roles, policies",
		demoTenant.id,
	);

	const demoIamViewerRole = await upsertRole(
		"iam-viewer",
		"Read-only access to all IAM resources",
		demoTenant.id,
	);

	const demoIdentityManagerRole = await upsertRole(
		"identity-manager",
		"Full CRUD access to identities only",
		demoTenant.id,
	);

	const demoRoleViewerRole = await upsertRole(
		"role-viewer",
		"Read-only access to roles",
		demoTenant.id,
	);

	// ── acme-inc ──────────────────────────────────────────────────────────────

	const acmeIamManagerRole = await upsertRole(
		"iam-manager",
		"Full IAM management: identities, roles, policies",
		acmeTenant.id,
	);

	const acmeIamViewerRole = await upsertRole(
		"iam-viewer",
		"Read-only access to all IAM resources",
		acmeTenant.id,
	);

	const acmeIdentityManagerRole = await upsertRole(
		"identity-manager",
		"Full CRUD access to identities only",
		acmeTenant.id,
	);

	const acmeUserRole = await upsertRole(
		"user",
		"Standard self-service user access",
		acmeTenant.id,
	);

	// ── startup-xyz ───────────────────────────────────────────────────────────

	const xyzTenantOwnerRole = await upsertRole(
		"tenant-owner",
		"Tenant owner — can manage identities within their own tenant",
		startupTenant.id,
	);

	const xyzIamViewerRole = await upsertRole(
		"iam-viewer",
		"Read-only access to all IAM resources",
		startupTenant.id,
	);

	const xyzUserRole = await upsertRole(
		"user",
		"Standard self-service user access",
		startupTenant.id,
	);

	console.log("\n── Role → Policy assignments ─────────────────");

	// admin
	await linkPolicyToRole(adminRole.id, adminPolicy.id, "admin → iam:admin:full-access");

	// ── demo-corp ─────────────────────────────────────────────────────────────

	await linkPolicyToRole(demoUserRole.id, userIdentityPolicy.id, "demo:user → iam:user:identity");
	await linkPolicyToRole(demoUserRole.id, userSessionPolicy.id, "demo:user → iam:user:session");

	await linkPolicyToRole(demoTenantOwnerRole.id, tenantOwnerIdentityPolicy.id, "demo:tenant-owner → iam:tenant-owner:identity-management");

	// iam-manager: full CRUD on identity + role, plus policy read
	// (Tenant management is ADMIN-only — no iam:tenant:read assigned)
	await linkPolicyToRole(demoIamManagerRole.id, identityFullAccessPolicy.id, "demo:iam-manager → iam:identity:full-access");
	await linkPolicyToRole(demoIamManagerRole.id, roleFullAccessPolicy.id, "demo:iam-manager → iam:role:full-access");
	await linkPolicyToRole(demoIamManagerRole.id, policyReadPolicy.id, "demo:iam-manager → iam:policy:read-only");

	await linkPolicyToRole(demoIamViewerRole.id, iamReadOnlyPolicy.id, "demo:iam-viewer → iam:read-only");

	await linkPolicyToRole(demoIdentityManagerRole.id, identityFullAccessPolicy.id, "demo:identity-manager → iam:identity:full-access");

	await linkPolicyToRole(demoRoleViewerRole.id, roleReadOnlyPolicy.id, "demo:role-viewer → iam:role:read-only");

	// ── acme-inc ──────────────────────────────────────────────────────────────

	await linkPolicyToRole(acmeIamManagerRole.id, identityFullAccessPolicy.id, "acme:iam-manager → iam:identity:full-access");
	await linkPolicyToRole(acmeIamManagerRole.id, roleFullAccessPolicy.id, "acme:iam-manager → iam:role:full-access");
	await linkPolicyToRole(acmeIamManagerRole.id, policyReadPolicy.id, "acme:iam-manager → iam:policy:read-only");

	await linkPolicyToRole(acmeIamViewerRole.id, iamReadOnlyPolicy.id, "acme:iam-viewer → iam:read-only");

	await linkPolicyToRole(acmeIdentityManagerRole.id, identityFullAccessPolicy.id, "acme:identity-manager → iam:identity:full-access");

	await linkPolicyToRole(acmeUserRole.id, userIdentityPolicy.id, "acme:user → iam:user:identity");
	await linkPolicyToRole(acmeUserRole.id, userSessionPolicy.id, "acme:user → iam:user:session");

	// ── startup-xyz ───────────────────────────────────────────────────────────

	await linkPolicyToRole(xyzTenantOwnerRole.id, tenantOwnerIdentityPolicy.id, "xyz:tenant-owner → iam:tenant-owner:identity-management");

	await linkPolicyToRole(xyzIamViewerRole.id, iamReadOnlyPolicy.id, "xyz:iam-viewer → iam:read-only");

	await linkPolicyToRole(xyzUserRole.id, userIdentityPolicy.id, "xyz:user → iam:user:identity");
	await linkPolicyToRole(xyzUserRole.id, userSessionPolicy.id, "xyz:user → iam:user:session");

	console.log("\n── Identities ────────────────────────────────");

	// ── platform ──────────────────────────────────────────────────────────────

	const adminIdentity = await upsertIdentity({
		tenantId: null,
		username: "admin",
		email: "admin@example.com",
		password: "Password@1234!",
		kind: "ADMIN",
	});

	// ── demo-corp ─────────────────────────────────────────────────────────────

	const testUser = await upsertIdentity({
		tenantId: demoTenant.id,
		username: "testuser",
		email: "testuser@example.com",
		password: "Password@1234!",
		kind: "USER",
	});

	const iamManagerUser = await upsertIdentity({
		tenantId: demoTenant.id,
		username: "iam-manager",
		email: "iam-manager@example.com",
		password: "Password@1234!",
		kind: "USER",
	});

	const iamViewerUser = await upsertIdentity({
		tenantId: demoTenant.id,
		username: "iam-viewer",
		email: "iam-viewer@example.com",
		password: "Password@1234!",
		kind: "USER",
	});

	const identityManagerUser = await upsertIdentity({
		tenantId: demoTenant.id,
		username: "identity-manager",
		email: "identity-manager@example.com",
		password: "Password@1234!",
		kind: "USER",
	});

	// ── demo-corp: bulk identities (53 users across 6 departments) ────────────

	const demoDeveloperUsers = await Promise.all([
		upsertIdentity({ tenantId: demoTenant.id, username: "dev-alice",   email: "dev-alice@demo-corp.example.com",   password: "Password@1234!", kind: "USER" }),
		upsertIdentity({ tenantId: demoTenant.id, username: "dev-bob",     email: "dev-bob@demo-corp.example.com",     password: "Password@1234!", kind: "USER" }),
		upsertIdentity({ tenantId: demoTenant.id, username: "dev-charlie", email: "dev-charlie@demo-corp.example.com", password: "Password@1234!", kind: "USER" }),
		upsertIdentity({ tenantId: demoTenant.id, username: "dev-diana",   email: "dev-diana@demo-corp.example.com",   password: "Password@1234!", kind: "USER" }),
		upsertIdentity({ tenantId: demoTenant.id, username: "dev-evan",    email: "dev-evan@demo-corp.example.com",    password: "Password@1234!", kind: "USER" }),
		upsertIdentity({ tenantId: demoTenant.id, username: "dev-fiona",   email: "dev-fiona@demo-corp.example.com",   password: "Password@1234!", kind: "USER" }),
		upsertIdentity({ tenantId: demoTenant.id, username: "dev-george",  email: "dev-george@demo-corp.example.com",  password: "Password@1234!", kind: "USER" }),
		upsertIdentity({ tenantId: demoTenant.id, username: "dev-hannah",  email: "dev-hannah@demo-corp.example.com",  password: "Password@1234!", kind: "USER" }),
		upsertIdentity({ tenantId: demoTenant.id, username: "dev-ivan",    email: "dev-ivan@demo-corp.example.com",    password: "Password@1234!", kind: "USER" }),
		upsertIdentity({ tenantId: demoTenant.id, username: "dev-julia",   email: "dev-julia@demo-corp.example.com",   password: "Password@1234!", kind: "USER" }),
		upsertIdentity({ tenantId: demoTenant.id, username: "dev-kevin",   email: "dev-kevin@demo-corp.example.com",   password: "Password@1234!", kind: "USER" }),
		upsertIdentity({ tenantId: demoTenant.id, username: "dev-laura",   email: "dev-laura@demo-corp.example.com",   password: "Password@1234!", kind: "USER" }),
	]);

	const demoHrUsers = await Promise.all([
		upsertIdentity({ tenantId: demoTenant.id, username: "hr-alex",  email: "hr-alex@demo-corp.example.com",  password: "Password@1234!", kind: "USER" }),
		upsertIdentity({ tenantId: demoTenant.id, username: "hr-beth",  email: "hr-beth@demo-corp.example.com",  password: "Password@1234!", kind: "USER" }),
		upsertIdentity({ tenantId: demoTenant.id, username: "hr-carl",  email: "hr-carl@demo-corp.example.com",  password: "Password@1234!", kind: "USER" }),
		upsertIdentity({ tenantId: demoTenant.id, username: "hr-dana",  email: "hr-dana@demo-corp.example.com",  password: "Password@1234!", kind: "USER" }),
		upsertIdentity({ tenantId: demoTenant.id, username: "hr-eric",  email: "hr-eric@demo-corp.example.com",  password: "Password@1234!", kind: "USER" }),
		upsertIdentity({ tenantId: demoTenant.id, username: "hr-faye",  email: "hr-faye@demo-corp.example.com",  password: "Password@1234!", kind: "USER" }),
		upsertIdentity({ tenantId: demoTenant.id, username: "hr-gary",  email: "hr-gary@demo-corp.example.com",  password: "Password@1234!", kind: "USER" }),
		upsertIdentity({ tenantId: demoTenant.id, username: "hr-helen", email: "hr-helen@demo-corp.example.com", password: "Password@1234!", kind: "USER" }),
		upsertIdentity({ tenantId: demoTenant.id, username: "hr-ian",   email: "hr-ian@demo-corp.example.com",   password: "Password@1234!", kind: "USER" }),
		upsertIdentity({ tenantId: demoTenant.id, username: "hr-jane",  email: "hr-jane@demo-corp.example.com",  password: "Password@1234!", kind: "USER" }),
	]);

	const demoAnalystUsers = await Promise.all([
		upsertIdentity({ tenantId: demoTenant.id, username: "analyst-01", email: "analyst-01@demo-corp.example.com", password: "Password@1234!", kind: "USER" }),
		upsertIdentity({ tenantId: demoTenant.id, username: "analyst-02", email: "analyst-02@demo-corp.example.com", password: "Password@1234!", kind: "USER" }),
		upsertIdentity({ tenantId: demoTenant.id, username: "analyst-03", email: "analyst-03@demo-corp.example.com", password: "Password@1234!", kind: "USER" }),
		upsertIdentity({ tenantId: demoTenant.id, username: "analyst-04", email: "analyst-04@demo-corp.example.com", password: "Password@1234!", kind: "USER" }),
		upsertIdentity({ tenantId: demoTenant.id, username: "analyst-05", email: "analyst-05@demo-corp.example.com", password: "Password@1234!", kind: "USER" }),
		upsertIdentity({ tenantId: demoTenant.id, username: "analyst-06", email: "analyst-06@demo-corp.example.com", password: "Password@1234!", kind: "USER" }),
		upsertIdentity({ tenantId: demoTenant.id, username: "analyst-07", email: "analyst-07@demo-corp.example.com", password: "Password@1234!", kind: "USER" }),
		upsertIdentity({ tenantId: demoTenant.id, username: "analyst-08", email: "analyst-08@demo-corp.example.com", password: "Password@1234!", kind: "USER" }),
		upsertIdentity({ tenantId: demoTenant.id, username: "analyst-09", email: "analyst-09@demo-corp.example.com", password: "Password@1234!", kind: "USER" }),
		upsertIdentity({ tenantId: demoTenant.id, username: "analyst-10", email: "analyst-10@demo-corp.example.com", password: "Password@1234!", kind: "USER" }),
	]);

	const demoManagerUsers = await Promise.all([
		upsertIdentity({ tenantId: demoTenant.id, username: "mgr-alice",   email: "mgr-alice@demo-corp.example.com",   password: "Password@1234!", kind: "USER" }),
		upsertIdentity({ tenantId: demoTenant.id, username: "mgr-bob",     email: "mgr-bob@demo-corp.example.com",     password: "Password@1234!", kind: "USER" }),
		upsertIdentity({ tenantId: demoTenant.id, username: "mgr-charlie", email: "mgr-charlie@demo-corp.example.com", password: "Password@1234!", kind: "USER" }),
		upsertIdentity({ tenantId: demoTenant.id, username: "mgr-diana",   email: "mgr-diana@demo-corp.example.com",   password: "Password@1234!", kind: "USER" }),
		upsertIdentity({ tenantId: demoTenant.id, username: "mgr-evan",    email: "mgr-evan@demo-corp.example.com",    password: "Password@1234!", kind: "USER" }),
		upsertIdentity({ tenantId: demoTenant.id, username: "mgr-fiona",   email: "mgr-fiona@demo-corp.example.com",   password: "Password@1234!", kind: "USER" }),
		upsertIdentity({ tenantId: demoTenant.id, username: "mgr-george",  email: "mgr-george@demo-corp.example.com",  password: "Password@1234!", kind: "USER" }),
		upsertIdentity({ tenantId: demoTenant.id, username: "mgr-hannah",  email: "mgr-hannah@demo-corp.example.com",  password: "Password@1234!", kind: "USER" }),
	]);

	const demoAuditorUsers = await Promise.all([
		upsertIdentity({ tenantId: demoTenant.id, username: "auditor-01", email: "auditor-01@demo-corp.example.com", password: "Password@1234!", kind: "USER" }),
		upsertIdentity({ tenantId: demoTenant.id, username: "auditor-02", email: "auditor-02@demo-corp.example.com", password: "Password@1234!", kind: "USER" }),
		upsertIdentity({ tenantId: demoTenant.id, username: "auditor-03", email: "auditor-03@demo-corp.example.com", password: "Password@1234!", kind: "USER" }),
		upsertIdentity({ tenantId: demoTenant.id, username: "auditor-04", email: "auditor-04@demo-corp.example.com", password: "Password@1234!", kind: "USER" }),
		upsertIdentity({ tenantId: demoTenant.id, username: "auditor-05", email: "auditor-05@demo-corp.example.com", password: "Password@1234!", kind: "USER" }),
		upsertIdentity({ tenantId: demoTenant.id, username: "auditor-06", email: "auditor-06@demo-corp.example.com", password: "Password@1234!", kind: "USER" }),
	]);

	const demoSupportUsers = await Promise.all([
		upsertIdentity({ tenantId: demoTenant.id, username: "support-01", email: "support-01@demo-corp.example.com", password: "Password@1234!", kind: "USER" }),
		upsertIdentity({ tenantId: demoTenant.id, username: "support-02", email: "support-02@demo-corp.example.com", password: "Password@1234!", kind: "USER" }),
		upsertIdentity({ tenantId: demoTenant.id, username: "support-03", email: "support-03@demo-corp.example.com", password: "Password@1234!", kind: "USER" }),
		upsertIdentity({ tenantId: demoTenant.id, username: "support-04", email: "support-04@demo-corp.example.com", password: "Password@1234!", kind: "USER" }),
		upsertIdentity({ tenantId: demoTenant.id, username: "support-05", email: "support-05@demo-corp.example.com", password: "Password@1234!", kind: "USER" }),
		upsertIdentity({ tenantId: demoTenant.id, username: "support-06", email: "support-06@demo-corp.example.com", password: "Password@1234!", kind: "USER" }),
		upsertIdentity({ tenantId: demoTenant.id, username: "support-07", email: "support-07@demo-corp.example.com", password: "Password@1234!", kind: "USER" }),
	]);

	// ── acme-inc ──────────────────────────────────────────────────────────────

	const acmeAdminUser = await upsertIdentity({
		tenantId: acmeTenant.id,
		username: "acme-admin",
		email: "acme-admin@acme-inc.example.com",
		password: "Password@1234!",
		kind: "USER",
	});

	const acmeAuditorUser = await upsertIdentity({
		tenantId: acmeTenant.id,
		username: "acme-auditor",
		email: "acme-auditor@acme-inc.example.com",
		password: "Password@1234!",
		kind: "USER",
	});

	const acmeHrUser = await upsertIdentity({
		tenantId: acmeTenant.id,
		username: "acme-hr",
		email: "acme-hr@acme-inc.example.com",
		password: "Password@1234!",
		kind: "USER",
	});

	const acmeDevUser = await upsertIdentity({
		tenantId: acmeTenant.id,
		username: "acme-dev",
		email: "acme-dev@acme-inc.example.com",
		password: "Password@1234!",
		kind: "USER",
	});

	// ── startup-xyz ───────────────────────────────────────────────────────────

	const xyzFounderUser = await upsertIdentity({
		tenantId: startupTenant.id,
		username: "xyz-founder",
		email: "xyz-founder@startup-xyz.example.com",
		password: "Password@1234!",
		kind: "USER",
	});

	const xyzDevopsUser = await upsertIdentity({
		tenantId: startupTenant.id,
		username: "xyz-devops",
		email: "xyz-devops@startup-xyz.example.com",
		password: "Password@1234!",
		kind: "USER",
	});

	const xyzEmployeeUser = await upsertIdentity({
		tenantId: startupTenant.id,
		username: "xyz-employee",
		email: "xyz-employee@startup-xyz.example.com",
		password: "Password@1234!",
		kind: "USER",
	});

	console.log("\n── Identity → Role assignments ───────────────");

	// admin
	await linkRoleToIdentity(adminRole.id, adminIdentity.id, "admin → role:admin");

	// ── demo-corp ─────────────────────────────────────────────────────────────

	// testuser: user + tenant-owner + role-viewer (Identities ✓, Roles ✓, Policies ✗, Tenants ✗)
	await linkRoleToIdentity(demoUserRole.id, testUser.id, "testuser → role:user");
	await linkRoleToIdentity(demoTenantOwnerRole.id, testUser.id, "testuser → role:tenant-owner");
	await linkRoleToIdentity(demoRoleViewerRole.id, testUser.id, "testuser → role:role-viewer");

	await linkRoleToIdentity(demoIamManagerRole.id, iamManagerUser.id, "iam-manager → role:iam-manager");
	await linkRoleToIdentity(demoIamViewerRole.id, iamViewerUser.id, "iam-viewer → role:iam-viewer");
	await linkRoleToIdentity(demoIdentityManagerRole.id, identityManagerUser.id, "identity-manager → role:identity-manager");

	// ── demo-corp: bulk role assignments ─────────────────────────────────────

	for (const u of demoDeveloperUsers) {
		await linkRoleToIdentity(demoUserRole.id, u.id, `${u.username} → role:user`);
	}
	for (const u of demoHrUsers) {
		await linkRoleToIdentity(demoIdentityManagerRole.id, u.id, `${u.username} → role:identity-manager`);
	}
	for (const u of demoAnalystUsers) {
		await linkRoleToIdentity(demoIamViewerRole.id, u.id, `${u.username} → role:iam-viewer`);
	}
	for (const u of demoManagerUsers) {
		await linkRoleToIdentity(demoIamManagerRole.id, u.id, `${u.username} → role:iam-manager`);
	}
	for (const u of demoAuditorUsers) {
		await linkRoleToIdentity(demoIamViewerRole.id, u.id, `${u.username} → role:iam-viewer`);
	}
	for (const u of demoSupportUsers) {
		await linkRoleToIdentity(demoUserRole.id, u.id, `${u.username} → role:user`);
	}

	// ── acme-inc ──────────────────────────────────────────────────────────────

	await linkRoleToIdentity(acmeIamManagerRole.id, acmeAdminUser.id, "acme-admin → role:iam-manager");
	await linkRoleToIdentity(acmeIamViewerRole.id, acmeAuditorUser.id, "acme-auditor → role:iam-viewer");
	await linkRoleToIdentity(acmeIdentityManagerRole.id, acmeHrUser.id, "acme-hr → role:identity-manager");
	await linkRoleToIdentity(acmeUserRole.id, acmeDevUser.id, "acme-dev → role:user");

	// ── startup-xyz ───────────────────────────────────────────────────────────

	await linkRoleToIdentity(xyzTenantOwnerRole.id, xyzFounderUser.id, "xyz-founder → role:tenant-owner");
	await linkRoleToIdentity(xyzIamViewerRole.id, xyzDevopsUser.id, "xyz-devops → role:iam-viewer");
	await linkRoleToIdentity(xyzUserRole.id, xyzEmployeeUser.id, "xyz-employee → role:user");

	console.log("\n── Done ──────────────────────────────────────\n");
	console.log("Test credentials — login format: username@tenant-slug");
	console.log("Admin login: username only (e.g. admin)\n");
	console.log("Platform:");
	console.log("  admin             (Password@1234!)  → all IAM sections  [ADMIN bypass]");
	console.log("\ndemo-corp:");
	console.log("  iam-manager       (Password@1234!)  → Identities+Roles+Policies (write) — no Tenants");
	console.log("  iam-viewer        (Password@1234!)  → Identities+Roles+Policies (read)  — no Tenants");
	console.log("  identity-manager  (Password@1234!)  → Identities only (write)");
	console.log("  testuser          (Password@1234!)  → Identities + Roles only");
	console.log("  + 53 bulk users   (Password@1234!)  → dev-* (user) | hr-* (identity-manager) | analyst-* (iam-viewer) | mgr-* (iam-manager) | auditor-* (iam-viewer) | support-* (user)");
	console.log("\nacme-inc  [modules: iam, inventory]:");
	console.log("  acme-admin        (Password@1234!)  → Identities+Roles+Policies (write) — no Tenants");
	console.log("  acme-auditor      (Password@1234!)  → Identities+Roles+Policies (read)  — no Tenants");
	console.log("  acme-hr           (Password@1234!)  → Identities only (write)");
	console.log("  acme-dev          (Password@1234!)  → Identities only (self-service)");
	console.log("\nstartup-xyz  [modules: iam]:");
	console.log("  xyz-founder       (Password@1234!)  → Identities (create/read/list)");
	console.log("  xyz-devops        (Password@1234!)  → Identities+Roles+Policies (read)  — no Tenants");
	console.log("  xyz-employee      (Password@1234!)  → Identities only (self-service)");
	console.log();
}

main()
	.catch((err) => {
		console.error(err);
		process.exit(1);
	})
	.finally(() => prisma.$disconnect());

