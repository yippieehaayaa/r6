import { prisma } from "../../src/client.js";
import { log, skip } from "./helpers.js";

export async function upsertRole(
	name: string,
	description: string,
	tenantId: string,
) {
	// @@unique([tenantId, name]) — scope lookup to the correct tenant
	const exists = await prisma.role.findFirst({
		where: { tenantId, name },
	});

	if (exists) {
		skip(`role "${name}"`);
		return exists;
	}

	const r = await prisma.role.create({
		data: { tenantId, name, description },
	});
	log(`role "${name}"`);
	return r;
}

export async function linkPolicyToRole(
	roleId: string,
	policyId: string,
	label: string,
) {
	const exists = await prisma.rolePolicy.findFirst({
		where: { roleId, policyId },
	});

	if (exists) {
		skip(`policy → role "${label}"`);
		return;
	}

	await prisma.rolePolicy.create({
		data: { roleId, policyId },
	});
	log(`policy → role "${label}"`);
}
