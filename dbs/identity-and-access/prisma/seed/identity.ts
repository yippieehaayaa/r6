import { encryptPassword } from "@r6/bcrypt";
import { prisma } from "../../src/client.js";
import { log, skip } from "./helpers.js";

export async function upsertIdentity(input: {
	tenantId?: string | null;
	username: string;
	email?: string;
	password: string;
	kind: "USER" | "ADMIN" | "SERVICE";
}) {
	// @@unique([tenantId, username]) — scope lookup to the correct tenant
	const exists = await prisma.identity.findFirst({
		where: { tenantId: input.tenantId ?? null, username: input.username },
	});

	if (exists) {
		skip(`identity "${input.username}"`);
		return exists;
	}

	const { hash, salt } = await encryptPassword(input.password);

	const identity = await prisma.identity.create({
		data: {
			tenantId: input.tenantId ?? null,
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
