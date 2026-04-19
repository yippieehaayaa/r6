import { encryptPassword } from "@r6/bcrypt";
import { hmac } from "@r6/crypto";
import { prisma } from "../../src/client.js";
import { log, skip } from "./helpers.js";

export async function upsertIdentity(input: {
	tenantId?: string | null;
	firstName: string;
	middleName?: string | null;
	lastName: string;
	country: string;
	username: string;
	email: string;
	password: string;
	kind: "USER" | "SERVICE";
}) {
	// @unique username — globally unique, no tenant scope needed
	const exists = await prisma.identity.findFirst({
		where: { username: input.username },
	});

	if (exists) {
		skip(`identity "${input.username}"`);
		return exists;
	}

	const { hash, salt } = await encryptPassword(hmac(input.password));

	const identity = await prisma.identity.create({
		data: {
			tenantId: input.tenantId ?? null,
			firstName: input.firstName,
			middleName: input.middleName ?? null,
			lastName: input.lastName,
			country: input.country,
			username: input.username,
			email: input.email,
			hash,
			salt,
			kind: input.kind,
			status: "ACTIVE",
			isEmailVerified: true,
			mustChangePassword: false,
		},
	});

	log(`identity "${input.username}" (${input.kind})`);
	return identity;
}

