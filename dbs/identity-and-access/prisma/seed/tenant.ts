import type { TenantModule } from "../../generated/prisma/client.js";
import { prisma } from "../../src/client.js";
import { log, skip } from "./helpers.js";

export async function upsertTenant(input: {
	name: string;
	slug: string;
	moduleAccess: TenantModule[];
	isPlatform?: boolean;
}) {
	const exists = await prisma.tenant.findUnique({
		where: { slug: input.slug },
	});

	if (exists) {
		skip(`tenant "${input.name}"`);
		return exists;
	}

	const t = await prisma.tenant.create({
		data: {
			name: input.name,
			slug: input.slug,
			moduleAccess: { set: input.moduleAccess },
			isPlatform: input.isPlatform ?? false,
		},
	});
	log(`tenant "${input.name}" (${input.slug})`);
	return t;
}
