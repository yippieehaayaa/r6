import { prisma } from "../../src/client.js";
import { log, skip } from "./helpers.js";

export async function upsertPolicy(input: {
	tenantId: string;
	name: string;
	description: string;
	permissions: string[];
}) {
	// @@unique([tenantId, name]) — scope lookup to the correct tenant
	const exists = await prisma.policy.findFirst({
		where: { tenantId: input.tenantId, name: input.name },
	});

	if (exists) {
		skip(`policy "${input.name}"`);
		return exists;
	}

	const p = await prisma.policy.create({
		data: {
			tenantId: input.tenantId,
			name: input.name,
			description: input.description,
			permissions: input.permissions,
		},
	});
	log(`policy "${input.name}"`);
	return p;
}
