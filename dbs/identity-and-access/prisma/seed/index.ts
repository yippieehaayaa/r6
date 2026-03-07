/**
 * Seed: identity-and-access
 *
 * Idempotent — safe to run multiple times. Existing records are skipped.
 * Run with: pnpm db:seed  (from dbs/identity-and-access/)
 *
 * Permission format: {service}:{resource}:{action}
 *   service  → iam
 *   resource → identity | session | otp | role | policy | group | service-client | audit-log
 *   action   → read | write | delete | list | * (wildcard)
 *
 * Hierarchy: Identity / Group → Role → Policy → permissions[]
 *
 * Seeded identities:
 * ┌────────────┬──────────────┬─────────┬────────────────────────────────────────────┐
 * │ username   │ password     │ kind    │ access path                                │
 * ├────────────┼──────────────┼─────────┼────────────────────────────────────────────┤
 * │ admin      │ Admin@1234!  │ ADMIN   │ direct role: admin (iam:*:*)               │
 * │ testuser   │ User@1234!   │ USER    │ direct role: user                          │
 * │ devuser    │ Dev@1234!    │ USER    │ group: developers → role: operator         │
 * └────────────┴──────────────┴─────────┴────────────────────────────────────────────┘
 */

import { encryptPassword } from "@r6/bcrypt";
import { prisma } from "../../src/client.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const log = (msg: string) => console.log(`  ✓ ${msg}`);
const skip = (msg: string) =>
	console.log(`  · ${msg} (already exists, skipped)`);

async function upsertIdentity(input: {
	username: string;
	email: string;
	password: string;
	kind: "USER" | "ADMIN" | "SERVICE";
}) {
	const exists = await prisma.identity.findUnique({
		where: { username: input.username },
	});

	if (exists) {
		skip(`identity "${input.username}"`);
		return exists;
	}

	const { hash, salt } = await encryptPassword(input.password);

	const identity = await prisma.identity.create({
		data: {
			username: input.username,
			email: input.email,
			hash,
			salt,
			kind: input.kind,
			status: "ACTIVE",
			changePassword: false,
		},
	});

	log(`identity "${input.username}" (${input.kind})`);
	return identity;
}

async function upsertPolicy(input: {
	name: string;
	description: string;
	effect: "ALLOW" | "DENY";
	permissions: string[];
	audience: string[];
}) {
	const exists = await prisma.policy.findUnique({
		where: { name: input.name },
	});

	if (exists) {
		skip(`policy "${input.name}"`);
		return exists;
	}

	const p = await prisma.policy.create({ data: input });
	log(`policy "${input.name}" (${input.effect})`);
	return p;
}

async function upsertRole(name: string, description: string) {
	const exists = await prisma.role.findUnique({ where: { name } });

	if (exists) {
		skip(`role "${name}"`);
		return exists;
	}

	const r = await prisma.role.create({ data: { name, description } });
	log(`role "${name}"`);
	return r;
}

async function upsertGroup(name: string, description: string) {
	const exists = await prisma.group.findUnique({ where: { name } });

	if (exists) {
		skip(`group "${name}"`);
		return exists;
	}

	const g = await prisma.group.create({ data: { name, description } });
	log(`group "${name}"`);
	return g;
}

async function linkPolicyToRole(
	roleId: string,
	policyId: string,
	label: string,
) {
	const r = await prisma.role.findUnique({
		where: { id: roleId },
		include: { policies: { where: { id: policyId } } },
	});

	if (r?.policies.length) {
		skip(`policy → role "${label}"`);
		return;
	}

	await prisma.role.update({
		where: { id: roleId },
		data: { policies: { connect: { id: policyId } } },
	});
	log(`policy → role "${label}"`);
}

async function linkRoleToIdentity(
	roleId: string,
	identityId: string,
	label: string,
) {
	const r = await prisma.role.findUnique({
		where: { id: roleId },
		include: { identities: { where: { id: identityId } } },
	});

	if (r?.identities.length) {
		skip(`role → identity "${label}"`);
		return;
	}

	await prisma.role.update({
		where: { id: roleId },
		data: { identities: { connect: { id: identityId } } },
	});
	log(`role → identity "${label}"`);
}

async function linkRoleToGroup(roleId: string, groupId: string, label: string) {
	const r = await prisma.role.findUnique({
		where: { id: roleId },
		include: { groups: { where: { id: groupId } } },
	});

	if (r?.groups.length) {
		skip(`role → group "${label}"`);
		return;
	}

	await prisma.role.update({
		where: { id: roleId },
		data: { groups: { connect: { id: groupId } } },
	});
	log(`role → group "${label}"`);
}

async function linkIdentityToGroup(
	identityId: string,
	groupId: string,
	label: string,
) {
	const g = await prisma.group.findUnique({
		where: { id: groupId },
		include: { identities: { where: { id: identityId } } },
	});

	if (g?.identities.length) {
		skip(`identity → group "${label}"`);
		return;
	}

	await prisma.group.update({
		where: { id: groupId },
		data: { identities: { connect: { id: identityId } } },
	});
	log(`identity → group "${label}"`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
	console.log("\n── Policies ──────────────────────────────────");

	// Admin: full IAM wildcard
	const adminPolicy = await upsertPolicy({
		name: "iam:admin:full-access",
		description: "Grants full access to all IAM resources and actions",
		effect: "ALLOW",
		permissions: ["iam:*:*"],
		audience: ["iam-api"],
	});

	// Operator: identity / session / group management — no role or policy management
	const operatorIdentityPolicy = await upsertPolicy({
		name: "iam:operator:identity",
		description: "Read and write access to identities",
		effect: "ALLOW",
		permissions: [
			"iam:identity:list",
			"iam:identity:read",
			"iam:identity:write",
		],
		audience: ["iam-api"],
	});

	const operatorSessionPolicy = await upsertPolicy({
		name: "iam:operator:session",
		description: "Read and revoke sessions",
		effect: "ALLOW",
		permissions: ["iam:session:list", "iam:session:read", "iam:session:delete"],
		audience: ["iam-api"],
	});

	const operatorGroupPolicy = await upsertPolicy({
		name: "iam:operator:group",
		description: "Read and write access to groups",
		effect: "ALLOW",
		permissions: ["iam:group:list", "iam:group:read", "iam:group:write"],
		audience: ["iam-api"],
	});

	// User: self-service only
	const userIdentityPolicy = await upsertPolicy({
		name: "iam:user:identity",
		description: "Read own identity",
		effect: "ALLOW",
		permissions: ["iam:identity:read"],
		audience: ["iam-api"],
	});

	const userSessionPolicy = await upsertPolicy({
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
		name: "iam:user:otp",
		description: "Request and verify OTPs",
		effect: "ALLOW",
		permissions: ["iam:otp:read", "iam:otp:write"],
		audience: ["iam-api"],
	});

	console.log("\n── Roles ─────────────────────────────────────");

	const adminRole = await upsertRole("admin", "Full IAM administration access");
	const operatorRole = await upsertRole(
		"operator",
		"Operational access — identity, session, and group management",
	);
	const userRole = await upsertRole(
		"user",
		"Standard self-service user access",
	);

	console.log("\n── Groups ────────────────────────────────────");

	const developersGroup = await upsertGroup(
		"developers",
		"Development team — operator-level access via group membership",
	);

	console.log("\n── Role → Policy assignments ─────────────────");

	await linkPolicyToRole(
		adminRole.id,
		adminPolicy.id,
		"admin → iam:admin:full-access",
	);

	await linkPolicyToRole(
		operatorRole.id,
		operatorIdentityPolicy.id,
		"operator → iam:operator:identity",
	);
	await linkPolicyToRole(
		operatorRole.id,
		operatorSessionPolicy.id,
		"operator → iam:operator:session",
	);
	await linkPolicyToRole(
		operatorRole.id,
		operatorGroupPolicy.id,
		"operator → iam:operator:group",
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

	console.log("\n── Role → Group assignments ──────────────────");

	await linkRoleToGroup(
		operatorRole.id,
		developersGroup.id,
		"operator → developers",
	);

	console.log("\n── Identities ────────────────────────────────");

	const adminIdentity = await upsertIdentity({
		username: "admin",
		email: "admin@example.com",
		password: "Admin@1234!",
		kind: "ADMIN",
	});

	const testUser = await upsertIdentity({
		username: "testuser",
		email: "testuser@example.com",
		password: "User@1234!",
		kind: "USER",
	});

	const devUser = await upsertIdentity({
		username: "devuser",
		email: "devuser@example.com",
		password: "Dev@1234!",
		kind: "USER",
	});

	console.log("\n── Identity → Role assignments ───────────────");

	await linkRoleToIdentity(
		adminRole.id,
		adminIdentity.id,
		"admin → role:admin",
	);
	await linkRoleToIdentity(userRole.id, testUser.id, "testuser → role:user");

	console.log("\n── Identity → Group assignments ──────────────");

	// devuser gets operator permissions via group membership, not a direct role
	await linkIdentityToGroup(
		devUser.id,
		developersGroup.id,
		"devuser → group:developers",
	);

	console.log("\n── Done ──────────────────────────────────────\n");
	console.log("Test credentials & resolved permissions:");
	console.log("  admin    → iam:*:*  (role:admin → iam:admin:full-access)");
	console.log(
		"  testuser → iam:identity:read, iam:session:read/write/delete, iam:otp:read/write  (role:user)",
	);
	console.log(
		"  devuser  → iam:identity:list/read/write, iam:session:list/read/delete, iam:group:list/read/write  (group:developers → role:operator)",
	);
	console.log();
}

main()
	.catch((err) => {
		console.error(err);
		process.exit(1);
	})
	.finally(() => prisma.$disconnect());
