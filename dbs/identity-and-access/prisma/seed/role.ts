import { prisma } from "../../src/client.js";
import { log, skip } from "./helpers.js";

export async function upsertRole(
	name: string,
	description: string,
	tenantId?: string | null,
) {
	// @@unique([tenantId, name]) — scope lookup to the correct tenant
	const exists = await prisma.role.findFirst({
		where: { tenantId: tenantId ?? null, name },
	});

	if (exists) {
		skip(`role "${name}"`);
		return exists;
	}

	const r = await prisma.role.create({
		data: { tenantId: tenantId ?? null, name, description },
	});
	log(`role "${name}"`);
	return r;
}

export async function linkPolicyToRole(
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
