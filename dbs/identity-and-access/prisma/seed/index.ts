/**
 * Seed: identity-and-access
 *
 * Idempotent — safe to run multiple times. Existing records are skipped.
 * Run with: pnpm db:seed  (from dbs/identity-and-access/)
 *
 * Permission format: {service}:{resource}:{action}
 *   service  → iam
 *   resource → identity | session | otp | role | policy
 *   action   → read | write | delete | list | * (wildcard)
 *
 * Hierarchy: Identity → Role → Policy → permissions[]
 *
 * Seeded identities:
 * ┌────────────┬──────────────┬─────────┬──────────────────────────────────────┐
 * │ username   │ password     │ kind    │ permissions                          │
 * ├────────────┼──────────────┼─────────┼──────────────────────────────────────┤
 * │ admin      │ Admin@1234!  │ ADMIN   │ iam:*:*  (role: admin)               │
 * │ testuser   │ User@1234!   │ USER    │ iam:identity:read, iam:session:*,    │
 * │            │              │         │ iam:otp:read/write  (role: user)     │
 * └────────────┴──────────────┴─────────┴──────────────────────────────────────┘
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

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
	console.log("\n── Policies ──────────────────────────────────");

	const adminPolicy = await upsertPolicy({
		name: "iam:admin:full-access",
		description: "Grants full access to all IAM resources and actions",
		effect: "ALLOW",
		permissions: ["iam:*:*"],
		audience: ["iam-api"],
	});

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
	const userRole = await upsertRole(
		"user",
		"Standard self-service user access",
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
		"  testuser → iam:identity:read, iam:session:read/write/delete, iam:otp:read/write  (role:user)",
	);
	console.log();
}

main()
	.catch((err) => {
		console.error(err);
		process.exit(1);
	})
	.finally(() => prisma.$disconnect());
