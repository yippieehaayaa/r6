import { encryptPassword } from "@r6/bcrypt";
import { hmac } from "@r6/crypto";
import { prisma } from "../../src/client.js";
import { log, skip } from "./helpers.js";

export async function upsertIdentity(input: {
	tenantId: string;
	username: string;
	email?: string;
	password: string;
	kind: "USER" | "ADMIN" | "SERVICE";
}) {
	// @@unique([tenantId, username]) — scope lookup to the correct tenant
	const exists = await prisma.identity.findFirst({
		where: { tenantId: input.tenantId, username: input.username },
	});

	if (exists) {
		skip(`identity "${input.username}"`);
		return exists;
	}

	const { hash, salt } = await encryptPassword(hmac(input.password));

	const identity = await prisma.identity.create({
		data: {
			tenantId: input.tenantId,
			username: input.username,
			email: input.email,
			hash,
			salt,
			kind: input.kind,
			status: "ACTIVE",
			mustChangePassword: false,
		},
	});

	log(`identity "${input.username}" (${input.kind})`);
	return identity;
}

export async function linkRoleToIdentity(
	roleId: string,
	identityId: string,
	label: string,
) {
	const exists = await prisma.identityRole.findFirst({
		where: { identityId, roleId },
	});

	if (exists) {
		skip(`role → identity "${label}"`);
		return;
	}

	await prisma.identityRole.create({
		data: { identityId, roleId },
	});
	log(`role → identity "${label}"`);
}
