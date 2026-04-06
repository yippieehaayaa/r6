import { type IdentitySafe, IdentitySafeSchema, RoleSchema } from "@r6/schemas";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { identityApi } from "@/api/_app";

const IdentitySafeWithRolesSchema = IdentitySafeSchema.extend({
	roles: z.array(RoleSchema),
});

export type IdentitySafeWithRoles = z.infer<typeof IdentitySafeWithRolesSchema>;

export async function getIdentityFn(
	tenantSlug: string,
	id: string,
): Promise<IdentitySafe> {
	const { data } = await identityApi.get<unknown>(
		`/tenants/${tenantSlug}/identities/${id}`,
	);
	return IdentitySafeSchema.parse(data);
}

export function useGetIdentityQuery(tenantSlug: string, id: string) {
	return useQuery({
		queryKey: ["identities", tenantSlug, id],
		queryFn: () => getIdentityFn(tenantSlug, id),
		enabled: !!tenantSlug && !!id,
	});
}

export async function getIdentityWithRolesFn(
	tenantSlug: string,
	id: string,
): Promise<IdentitySafeWithRoles> {
	const { data } = await identityApi.get<unknown>(
		`/tenants/${tenantSlug}/identities/${id}`,
	);
	return IdentitySafeWithRolesSchema.parse(data);
}

export function useGetIdentityWithRolesQuery(tenantSlug: string, id: string) {
	return useQuery({
		queryKey: ["identities", tenantSlug, id, "with-roles"],
		queryFn: () => getIdentityWithRolesFn(tenantSlug, id),
		enabled: !!tenantSlug && !!id,
	});
}
