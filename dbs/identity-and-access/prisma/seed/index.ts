/**
 * Seed: identity-and-access
 *
 * Idempotent — safe to run multiple times. Existing records are skipped.
 * Run with: pnpm db:seed  (from dbs/identity-and-access/)
 *
 * Seeded identities for API testing:
 * ┌────────────┬──────────────┬───────┬───────┐
 * │ username   │ password     │ kind  │ role  │
 * ├────────────┼──────────────┼───────┼───────┤
 * │ admin      │ Admin@1234!  │ ADMIN │ admin │
 * │ testuser   │ User@1234!   │ USER  │ user  │
 * │ devuser    │ Dev@1234!    │ USER  │ user  │
 * └────────────┴──────────────┴───────┴───────┘
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
	actions: string[];
	resources: string[];
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
		name: "admin:full-access",
		description: "Grants full access to all resources",
		effect: "ALLOW",
		actions: ["*"],
		resources: ["*"],
		audience: ["api.example.com"],
	});

	const userReadPolicy = await upsertPolicy({
		name: "user:read-self",
		description: "Allows a user to read their own identity",
		effect: "ALLOW",
		actions: ["identity:read"],
		resources: ["identity:*"],
		audience: ["api.example.com"],
	});

	console.log("\n── Roles ─────────────────────────────────────");

	const adminRole = await upsertRole("admin", "Full administrative access");
	const userRole = await upsertRole("user", "Standard user access");

	console.log("\n── Role → Policy assignments ─────────────────");

	await linkPolicyToRole(adminRole.id, adminPolicy.id, "admin");
	await linkPolicyToRole(userRole.id, userReadPolicy.id, "user");

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

	await linkRoleToIdentity(adminRole.id, adminIdentity.id, "admin → admin");
	await linkRoleToIdentity(userRole.id, testUser.id, "testuser → user");
	await linkRoleToIdentity(userRole.id, devUser.id, "devuser → user");

	console.log("\n── Done ──────────────────────────────────────\n");
	console.log("Test credentials:");
	console.log(
		"  POST /auth/login  { username: 'admin',    password: 'Admin@1234!' }",
	);
	console.log(
		"  POST /auth/login  { username: 'testuser', password: 'User@1234!'  }",
	);
	console.log(
		"  POST /auth/login  { username: 'devuser',  password: 'Dev@1234!'   }\n",
	);
}

main()
	.catch((err) => {
		console.error(err);
		process.exit(1);
	})
	.finally(() => prisma.$disconnect());
