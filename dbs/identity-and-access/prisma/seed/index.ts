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

	console.log("\n── Additional Tenants ────────────────────────");

	const extraTenantDefs = [
		// Tech / SaaS — iam only
		{ name: "Cloud Verse",    slug: "cloud-verse",    moduleAccess: ["iam"] },
		{ name: "Pixel Studio",   slug: "pixel-studio",   moduleAccess: ["iam"] },
		{ name: "Code Labs",      slug: "code-labs",      moduleAccess: ["iam"] },
		{ name: "Dev Stream",     slug: "dev-stream",     moduleAccess: ["iam"] },
		{ name: "API Hub",        slug: "api-hub",        moduleAccess: ["iam"] },
		{ name: "Byte Works",     slug: "byte-works",     moduleAccess: ["iam"] },
		{ name: "Net Craft",      slug: "net-craft",      moduleAccess: ["iam"] },
		{ name: "Web Forge",      slug: "web-forge",      moduleAccess: ["iam"] },
		// Finance — iam only
		{ name: "Fintech Global", slug: "fintech-global", moduleAccess: ["iam"] },
		{ name: "Pay Secure",     slug: "pay-secure",     moduleAccess: ["iam"] },
		{ name: "Wealth Track",   slug: "wealth-track",   moduleAccess: ["iam"] },
		{ name: "Credit Hub",     slug: "credit-hub",     moduleAccess: ["iam"] },
		{ name: "Invest Pro",     slug: "invest-pro",     moduleAccess: ["iam"] },
		{ name: "Trade Vault",    slug: "trade-vault",    moduleAccess: ["iam"] },
		{ name: "Asset Guard",    slug: "asset-guard",    moduleAccess: ["iam"] },
		{ name: "Fund Flow",      slug: "fund-flow",      moduleAccess: ["iam"] },
		{ name: "Capital Edge",   slug: "capital-edge",   moduleAccess: ["iam"] },
		{ name: "Money Bridge",   slug: "money-bridge",   moduleAccess: ["iam"] },
		// Education — iam only
		{ name: "Edu Platform",  slug: "edu-platform",  moduleAccess: ["iam"] },
		{ name: "Learn Hub",     slug: "learn-hub",     moduleAccess: ["iam"] },
		{ name: "Skill Forge",   slug: "skill-forge",   moduleAccess: ["iam"] },
		{ name: "Campus Net",    slug: "campus-net",    moduleAccess: ["iam"] },
		{ name: "Course Stream", slug: "course-stream", moduleAccess: ["iam"] },
		// Media — iam only
		{ name: "Media Stream",  slug: "media-stream",  moduleAccess: ["iam"] },
		{ name: "Content Hub",   slug: "content-hub",   moduleAccess: ["iam"] },
		{ name: "Publish Pro",   slug: "publish-pro",   moduleAccess: ["iam"] },
		{ name: "Broadcast Net", slug: "broadcast-net", moduleAccess: ["iam"] },
		// Tech — iam + inventory
		{ name: "Tech Nexus",    slug: "tech-nexus",    moduleAccess: ["iam", "inventory"] },
		{ name: "Data Forge",    slug: "data-forge",    moduleAccess: ["iam", "inventory"] },
		// Health / Pharma — iam + inventory
		{ name: "Health Connect", slug: "health-connect", moduleAccess: ["iam", "inventory"] },
		{ name: "Med Track",      slug: "med-track",      moduleAccess: ["iam", "inventory"] },
		{ name: "Care Plus",      slug: "care-plus",      moduleAccess: ["iam", "inventory"] },
		{ name: "Bio Systems",    slug: "bio-systems",    moduleAccess: ["iam", "inventory"] },
		{ name: "Pharm Direct",   slug: "pharm-direct",   moduleAccess: ["iam", "inventory"] },
		// Retail / E-commerce — iam + inventory
		{ name: "Retail Chain",  slug: "retail-chain",  moduleAccess: ["iam", "inventory"] },
		{ name: "Shop Sphere",   slug: "shop-sphere",   moduleAccess: ["iam", "inventory"] },
		{ name: "Market Hub",    slug: "market-hub",    moduleAccess: ["iam", "inventory"] },
		{ name: "Commerce Plus", slug: "commerce-plus", moduleAccess: ["iam", "inventory"] },
		{ name: "Store World",   slug: "store-world",   moduleAccess: ["iam", "inventory"] },
		{ name: "Cart Pro",      slug: "cart-pro",      moduleAccess: ["iam", "inventory"] },
		{ name: "Merch Net",     slug: "merch-net",     moduleAccess: ["iam", "inventory"] },
		{ name: "Goods Hub",     slug: "goods-hub",     moduleAccess: ["iam", "inventory"] },
		{ name: "Vendor Link",   slug: "vendor-link",   moduleAccess: ["iam", "inventory"] },
		{ name: "Supply Bridge", slug: "supply-bridge", moduleAccess: ["iam", "inventory"] },
		// Logistics — iam + inventory
		{ name: "Logistics Pro", slug: "logistics-pro", moduleAccess: ["iam", "inventory"] },
		{ name: "Ship Track",    slug: "ship-track",    moduleAccess: ["iam", "inventory"] },
		{ name: "Fleet Hub",     slug: "fleet-hub",     moduleAccess: ["iam", "inventory"] },
		{ name: "Cargo Net",     slug: "cargo-net",     moduleAccess: ["iam", "inventory"] },
		{ name: "Route Master",  slug: "route-master",  moduleAccess: ["iam", "inventory"] },
		// Energy — iam + inventory
		{ name: "Energy Grid",   slug: "energy-grid",   moduleAccess: ["iam", "inventory"] },
		{ name: "Power Systems", slug: "power-systems", moduleAccess: ["iam", "inventory"] },
	];

	const extraTenants = await Promise.all(extraTenantDefs.map(upsertTenant));

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

	console.log("\n── Additional Policies ───────────────────────");

	// ── IAM identity — granular single-action ──────────────────────────────────

	await upsertPolicy({
		tenantId: null,
		name: "iam:identity:create-only",
		description: "Create new identities only",
		effect: "ALLOW",
		permissions: ["iam:identity:create"],
		audience: ["iam"],
	});

	await upsertPolicy({
		tenantId: null,
		name: "iam:identity:update-only",
		description: "Update existing identities only",
		effect: "ALLOW",
		permissions: ["iam:identity:update"],
		audience: ["iam"],
	});

	await upsertPolicy({
		tenantId: null,
		name: "iam:identity:delete-only",
		description: "Delete identities only",
		effect: "ALLOW",
		permissions: ["iam:identity:delete"],
		audience: ["iam"],
	});

	await upsertPolicy({
		tenantId: null,
		name: "iam:identity:list-only",
		description: "List identities only",
		effect: "ALLOW",
		permissions: ["iam:identity:list"],
		audience: ["iam"],
	});

	await upsertPolicy({
		tenantId: null,
		name: "iam:identity:read-create",
		description: "Read and create identities",
		effect: "ALLOW",
		permissions: ["iam:identity:read", "iam:identity:create"],
		audience: ["iam"],
	});

	await upsertPolicy({
		tenantId: null,
		name: "iam:identity:read-update",
		description: "Read and update identities",
		effect: "ALLOW",
		permissions: ["iam:identity:read", "iam:identity:update"],
		audience: ["iam"],
	});

	// ── IAM role — granular single-action ─────────────────────────────────────

	await upsertPolicy({
		tenantId: null,
		name: "iam:role:create-only",
		description: "Create new roles only",
		effect: "ALLOW",
		permissions: ["iam:role:create"],
		audience: ["iam"],
	});

	await upsertPolicy({
		tenantId: null,
		name: "iam:role:update-only",
		description: "Update existing roles only",
		effect: "ALLOW",
		permissions: ["iam:role:update"],
		audience: ["iam"],
	});

	await upsertPolicy({
		tenantId: null,
		name: "iam:role:delete-only",
		description: "Delete roles only",
		effect: "ALLOW",
		permissions: ["iam:role:delete"],
		audience: ["iam"],
	});

	await upsertPolicy({
		tenantId: null,
		name: "iam:role:list-only",
		description: "List roles only",
		effect: "ALLOW",
		permissions: ["iam:role:list"],
		audience: ["iam"],
	});

	await upsertPolicy({
		tenantId: null,
		name: "iam:role:read-create",
		description: "Read and create roles",
		effect: "ALLOW",
		permissions: ["iam:role:read", "iam:role:create"],
		audience: ["iam"],
	});

	await upsertPolicy({
		tenantId: null,
		name: "iam:role:read-update",
		description: "Read and update roles",
		effect: "ALLOW",
		permissions: ["iam:role:read", "iam:role:update"],
		audience: ["iam"],
	});

	// ── IAM policy — granular ─────────────────────────────────────────────────

	await upsertPolicy({
		tenantId: null,
		name: "iam:policy:full-access",
		description: "Full CRUD access to policies",
		effect: "ALLOW",
		permissions: ["iam:policy:read", "iam:policy:create", "iam:policy:update", "iam:policy:delete"],
		audience: ["iam"],
	});

	await upsertPolicy({
		tenantId: null,
		name: "iam:policy:create-only",
		description: "Create new policies only",
		effect: "ALLOW",
		permissions: ["iam:policy:create"],
		audience: ["iam"],
	});

	await upsertPolicy({
		tenantId: null,
		name: "iam:policy:update-only",
		description: "Update existing policies only",
		effect: "ALLOW",
		permissions: ["iam:policy:update"],
		audience: ["iam"],
	});

	await upsertPolicy({
		tenantId: null,
		name: "iam:policy:delete-only",
		description: "Delete policies only",
		effect: "ALLOW",
		permissions: ["iam:policy:delete"],
		audience: ["iam"],
	});

	await upsertPolicy({
		tenantId: null,
		name: "iam:policy:list-only",
		description: "List policies only",
		effect: "ALLOW",
		permissions: ["iam:policy:list"],
		audience: ["iam"],
	});

	await upsertPolicy({
		tenantId: null,
		name: "iam:policy:read-create",
		description: "Read and create policies",
		effect: "ALLOW",
		permissions: ["iam:policy:read", "iam:policy:create"],
		audience: ["iam"],
	});

	// ── IAM session — granular ────────────────────────────────────────────────

	await upsertPolicy({
		tenantId: null,
		name: "iam:session:read-only",
		description: "Read-only access to sessions",
		effect: "ALLOW",
		permissions: ["iam:session:read"],
		audience: ["iam"],
	});

	await upsertPolicy({
		tenantId: null,
		name: "iam:session:write-only",
		description: "Write sessions only",
		effect: "ALLOW",
		permissions: ["iam:session:write"],
		audience: ["iam"],
	});

	await upsertPolicy({
		tenantId: null,
		name: "iam:session:delete-only",
		description: "Delete sessions only",
		effect: "ALLOW",
		permissions: ["iam:session:delete"],
		audience: ["iam"],
	});

	await upsertPolicy({
		tenantId: null,
		name: "iam:session:full-access",
		description: "Full access to sessions (read, write, delete)",
		effect: "ALLOW",
		permissions: ["iam:session:read", "iam:session:write", "iam:session:delete"],
		audience: ["iam"],
	});

	// ── IAM tenant — granular ─────────────────────────────────────────────────

	await upsertPolicy({
		tenantId: null,
		name: "iam:tenant:read-only",
		description: "Read-only access to tenants",
		effect: "ALLOW",
		permissions: ["iam:tenant:read"],
		audience: ["iam"],
	});

	await upsertPolicy({
		tenantId: null,
		name: "iam:tenant:create-only",
		description: "Create tenants only",
		effect: "ALLOW",
		permissions: ["iam:tenant:create"],
		audience: ["iam"],
	});

	await upsertPolicy({
		tenantId: null,
		name: "iam:tenant:update-only",
		description: "Update tenants only",
		effect: "ALLOW",
		permissions: ["iam:tenant:update"],
		audience: ["iam"],
	});

	await upsertPolicy({
		tenantId: null,
		name: "iam:tenant:delete-only",
		description: "Delete tenants only",
		effect: "ALLOW",
		permissions: ["iam:tenant:delete"],
		audience: ["iam"],
	});

	await upsertPolicy({
		tenantId: null,
		name: "iam:tenant:full-access",
		description: "Full CRUD access to tenants",
		effect: "ALLOW",
		permissions: ["iam:tenant:read", "iam:tenant:create", "iam:tenant:update", "iam:tenant:delete"],
		audience: ["iam"],
	});

	// ── IAM composite ─────────────────────────────────────────────────────────

	await upsertPolicy({
		tenantId: null,
		name: "iam:auditor:full-read",
		description: "Read-only across all IAM resources including sessions and tenants",
		effect: "ALLOW",
		permissions: [
			"iam:identity:read",
			"iam:role:read",
			"iam:policy:read",
			"iam:session:read",
			"iam:tenant:read",
		],
		audience: ["iam"],
	});

	await upsertPolicy({
		tenantId: null,
		name: "iam:developer:self-service",
		description: "Developer self-service: own identity plus full session management",
		effect: "ALLOW",
		permissions: [
			"iam:identity:read",
			"iam:session:read",
			"iam:session:write",
			"iam:session:delete",
		],
		audience: ["iam"],
	});

	await upsertPolicy({
		tenantId: null,
		name: "iam:operator:identity-role",
		description: "Full identity and role management with policy read-only",
		effect: "ALLOW",
		permissions: [
			"iam:identity:read",
			"iam:identity:create",
			"iam:identity:update",
			"iam:identity:delete",
			"iam:role:read",
			"iam:role:create",
			"iam:role:update",
			"iam:role:delete",
			"iam:policy:read",
		],
		audience: ["iam"],
	});

	await upsertPolicy({
		tenantId: null,
		name: "iam:support:read-all",
		description: "Support staff read-all: identities, roles, policies, sessions",
		effect: "ALLOW",
		permissions: [
			"iam:identity:read",
			"iam:role:read",
			"iam:policy:read",
			"iam:session:read",
		],
		audience: ["iam"],
	});

	await upsertPolicy({
		tenantId: null,
		name: "iam:support:identity-assist",
		description: "Support staff can read and update identities",
		effect: "ALLOW",
		permissions: ["iam:identity:read", "iam:identity:update"],
		audience: ["iam"],
	});

	// ── IAM DENY policies ─────────────────────────────────────────────────────

	await upsertPolicy({
		tenantId: null,
		name: "iam:deny:identity-delete",
		description: "Deny deletion of identities",
		effect: "DENY",
		permissions: ["iam:identity:delete"],
		audience: ["iam"],
	});

	await upsertPolicy({
		tenantId: null,
		name: "iam:deny:role-delete",
		description: "Deny deletion of roles",
		effect: "DENY",
		permissions: ["iam:role:delete"],
		audience: ["iam"],
	});

	await upsertPolicy({
		tenantId: null,
		name: "iam:deny:policy-write",
		description: "Deny create, update, and delete on policies",
		effect: "DENY",
		permissions: ["iam:policy:create", "iam:policy:update", "iam:policy:delete"],
		audience: ["iam"],
	});

	await upsertPolicy({
		tenantId: null,
		name: "iam:deny:tenant-delete",
		description: "Deny deletion of tenants",
		effect: "DENY",
		permissions: ["iam:tenant:delete"],
		audience: ["iam"],
	});

	// ── Inventory — product ───────────────────────────────────────────────────

	await upsertPolicy({
		tenantId: null,
		name: "inventory:product:read-only",
		description: "Read-only access to products",
		effect: "ALLOW",
		permissions: ["inventory:product:read"],
		audience: ["inventory"],
	});

	await upsertPolicy({
		tenantId: null,
		name: "inventory:product:create-only",
		description: "Create products only",
		effect: "ALLOW",
		permissions: ["inventory:product:create"],
		audience: ["inventory"],
	});

	await upsertPolicy({
		tenantId: null,
		name: "inventory:product:update-only",
		description: "Update products only",
		effect: "ALLOW",
		permissions: ["inventory:product:update"],
		audience: ["inventory"],
	});

	await upsertPolicy({
		tenantId: null,
		name: "inventory:product:delete-only",
		description: "Delete products only",
		effect: "ALLOW",
		permissions: ["inventory:product:delete"],
		audience: ["inventory"],
	});

	await upsertPolicy({
		tenantId: null,
		name: "inventory:product:full-access",
		description: "Full CRUD access to products",
		effect: "ALLOW",
		permissions: [
			"inventory:product:read",
			"inventory:product:create",
			"inventory:product:update",
			"inventory:product:delete",
		],
		audience: ["inventory"],
	});

	// ── Inventory — catalog ───────────────────────────────────────────────────

	await upsertPolicy({
		tenantId: null,
		name: "inventory:catalog:read-only",
		description: "Read-only access to catalog",
		effect: "ALLOW",
		permissions: ["inventory:catalog:read"],
		audience: ["inventory"],
	});

	await upsertPolicy({
		tenantId: null,
		name: "inventory:catalog:full-access",
		description: "Full CRUD access to catalog",
		effect: "ALLOW",
		permissions: [
			"inventory:catalog:read",
			"inventory:catalog:create",
			"inventory:catalog:update",
			"inventory:catalog:delete",
		],
		audience: ["inventory"],
	});

	// ── Inventory — stock ─────────────────────────────────────────────────────

	await upsertPolicy({
		tenantId: null,
		name: "inventory:stock:read-only",
		description: "Read-only access to stock levels",
		effect: "ALLOW",
		permissions: ["inventory:stock:read"],
		audience: ["inventory"],
	});

	await upsertPolicy({
		tenantId: null,
		name: "inventory:stock:update-only",
		description: "Update stock levels only",
		effect: "ALLOW",
		permissions: ["inventory:stock:update"],
		audience: ["inventory"],
	});

	await upsertPolicy({
		tenantId: null,
		name: "inventory:stock:full-access",
		description: "Full CRUD access to stock",
		effect: "ALLOW",
		permissions: [
			"inventory:stock:read",
			"inventory:stock:create",
			"inventory:stock:update",
			"inventory:stock:delete",
		],
		audience: ["inventory"],
	});

	// ── Inventory — procurement ───────────────────────────────────────────────

	await upsertPolicy({
		tenantId: null,
		name: "inventory:procurement:read-only",
		description: "Read-only access to procurement orders",
		effect: "ALLOW",
		permissions: ["inventory:procurement:read"],
		audience: ["inventory"],
	});

	await upsertPolicy({
		tenantId: null,
		name: "inventory:procurement:full-access",
		description: "Full CRUD access to procurement orders",
		effect: "ALLOW",
		permissions: [
			"inventory:procurement:read",
			"inventory:procurement:create",
			"inventory:procurement:update",
			"inventory:procurement:delete",
		],
		audience: ["inventory"],
	});

	// ── Inventory — season ────────────────────────────────────────────────────

	await upsertPolicy({
		tenantId: null,
		name: "inventory:season:read-only",
		description: "Read-only access to seasons",
		effect: "ALLOW",
		permissions: ["inventory:season:read"],
		audience: ["inventory"],
	});

	await upsertPolicy({
		tenantId: null,
		name: "inventory:season:full-access",
		description: "Full CRUD access to seasons",
		effect: "ALLOW",
		permissions: [
			"inventory:season:read",
			"inventory:season:create",
			"inventory:season:update",
			"inventory:season:delete",
		],
		audience: ["inventory"],
	});

	// ── Inventory — analytics ─────────────────────────────────────────────────

	await upsertPolicy({
		tenantId: null,
		name: "inventory:analytics:read-only",
		description: "Read-only access to inventory analytics",
		effect: "ALLOW",
		permissions: ["inventory:analytics:read"],
		audience: ["inventory"],
	});

	// ── Inventory — composite ─────────────────────────────────────────────────

	const inventoryReadOnlyPolicy = await upsertPolicy({
		tenantId: null,
		name: "inventory:read-only",
		description: "Read-only access to all inventory resources",
		effect: "ALLOW",
		permissions: [
			"inventory:product:read",
			"inventory:catalog:read",
			"inventory:stock:read",
			"inventory:procurement:read",
			"inventory:season:read",
			"inventory:analytics:read",
		],
		audience: ["inventory"],
	});

	const inventoryFullAccessPolicy = await upsertPolicy({
		tenantId: null,
		name: "inventory:full-access",
		description: "Full access to all inventory resources",
		effect: "ALLOW",
		permissions: [
			"inventory:product:*",
			"inventory:catalog:*",
			"inventory:stock:*",
			"inventory:procurement:*",
			"inventory:season:*",
			"inventory:analytics:*",
		],
		audience: ["inventory"],
	});

	await upsertPolicy({
		tenantId: null,
		name: "inventory:manager:operations",
		description: "Inventory operations manager: stock, procurement, product, and catalog access",
		effect: "ALLOW",
		permissions: [
			"inventory:product:read",
			"inventory:catalog:read",
			"inventory:stock:read",
			"inventory:stock:update",
			"inventory:procurement:read",
			"inventory:procurement:create",
			"inventory:procurement:update",
		],
		audience: ["inventory"],
	});

	// ── Cross-service composite ───────────────────────────────────────────────

	const crossServiceReadOnlyPolicy = await upsertPolicy({
		tenantId: null,
		name: "iam+inventory:read-only",
		description: "Read-only access across IAM and inventory services",
		effect: "ALLOW",
		permissions: [
			"iam:identity:read",
			"iam:role:read",
			"iam:policy:read",
			"inventory:product:read",
			"inventory:catalog:read",
			"inventory:stock:read",
		],
		audience: ["iam", "inventory"],
	});

	await upsertPolicy({
		tenantId: null,
		name: "iam+inventory:manager",
		description: "IAM user management combined with inventory management",
		effect: "ALLOW",
		permissions: [
			"iam:identity:read",
			"iam:identity:create",
			"iam:identity:update",
			"iam:role:read",
			"inventory:product:read",
			"inventory:product:create",
			"inventory:product:update",
			"inventory:stock:read",
			"inventory:stock:update",
		],
		audience: ["iam", "inventory"],
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

	console.log("\n── Additional Roles ──────────────────────────");

	// ── Platform-level additional roles ───────────────────────────────────────

	const inventoryManagerPlatformRole = await upsertRole(
		"inventory-manager",
		"Platform-level full inventory administration",
		null,
	);

	const platformViewerRole = await upsertRole(
		"platform-viewer",
		"Platform-level read-only access across IAM and inventory services",
		null,
	);

	// ── user role for every extra tenant (basic self-service) ─────────────────

	const extraTenantUserRoles = await Promise.all(
		extraTenants.map((t) =>
			upsertRole("user", "Standard self-service user access", t.id),
		),
	);

	// ── inventory-viewer role for tenants that include the inventory module ───

	const inventoryTenants = extraTenants.filter((t) =>
		t.moduleAccess.includes("inventory"),
	);

	const extraTenantInventoryViewerRoles = await Promise.all(
		inventoryTenants.map((t) =>
			upsertRole("inventory-viewer", "Read-only access to all inventory resources", t.id),
		),
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

	console.log("\n── Additional Role → Policy Assignments ─────");

	// Platform additional roles
	await linkPolicyToRole(inventoryManagerPlatformRole.id, inventoryFullAccessPolicy.id, "platform:inventory-manager → inventory:full-access");
	await linkPolicyToRole(platformViewerRole.id, crossServiceReadOnlyPolicy.id, "platform:platform-viewer → iam+inventory:read-only");

	// user role for each extra tenant: iam:user:identity + iam:user:session
	await Promise.all(
		extraTenantUserRoles.map((role, i) =>
			Promise.all([
				linkPolicyToRole(role.id, userIdentityPolicy.id, `${extraTenants[i]?.slug ?? ""}:user → iam:user:identity`),
				linkPolicyToRole(role.id, userSessionPolicy.id, `${extraTenants[i]?.slug ?? ""}:user → iam:user:session`),
			]),
		),
	);

	// inventory-viewer role for inventory tenants
	await Promise.all(
		extraTenantInventoryViewerRoles.map((role, i) =>
			linkPolicyToRole(role.id, inventoryReadOnlyPolicy.id, `${inventoryTenants[i]?.slug ?? ""}:inventory-viewer → inventory:read-only`),
		),
	);

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

