import { prisma } from "../../src/client.js";
import { log, skip } from "./helpers.js";

export async function upsertPolicy(input: {
	tenantId?: string | null;
	name: string;
	description: string;
	effect: "ALLOW" | "DENY";
	permissions: string[];
	audience: string[];
}) {
	// @@unique([tenantId, name]) — scope lookup to the correct tenant
	const exists = await prisma.policy.findFirst({
		where: { tenantId: input.tenantId ?? null, name: input.name },
	});

	if (exists) {
		skip(`policy "${input.name}"`);
		return exists;
	}

	const { tenantId, ...rest } = input;
	const p = await prisma.policy.create({
		data: { tenantId: tenantId ?? null, ...rest },
	});
	log(`policy "${input.name}" (${input.effect})`);
	return p;
}
