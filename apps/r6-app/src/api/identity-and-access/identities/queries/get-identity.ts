import { IdentitySafeSchema, RoleSchema } from "@r6/schemas";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { identityApi } from "@/api/_app";

const IdentitySafeWithRolesSchema = IdentitySafeSchema.extend({
	roles: z.array(RoleSchema),
});

export type IdentitySafeWithRoles = z.infer<typeof IdentitySafeWithRolesSchema>;

export async function getIdentityWithRolesFn(
	tenantSlug: string,
	id: string,
): Promise<IdentitySafeWithRoles> {
	const { data } = await identityApi.get<unknown>(
		`/tenants/${tenantSlug}/identities/${id}`,
	);
	return IdentitySafeWithRolesSchema.parse(data);
}

export function useGetIdentityWithRolesQuery(
	tenantSlug: string,
	id: string,
	options?: { enabled?: boolean },
) {
	return useQuery({
		queryKey: ["identities", tenantSlug, id],
		queryFn: () => getIdentityWithRolesFn(tenantSlug, id),
		enabled: (options?.enabled ?? true) && !!tenantSlug && !!id,
	});
}
