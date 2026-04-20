import { IdentitySafeSchema, RoleSchema } from "@r6/schemas";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { identityApi } from "@/api/_app";

const IdentityWithRolesSchema = IdentitySafeSchema.extend({
	roles: z.array(RoleSchema),
});

export type IdentityWithRoles = z.infer<typeof IdentityWithRolesSchema>;

export async function getIdentityWithRolesFn(
	tenantId: string,
	id: string,
): Promise<IdentityWithRoles> {
	const { data } = await identityApi.get<unknown>(
		`/tenants/${tenantId}/identities/${id}/roles`,
	);
	return IdentityWithRolesSchema.parse(data);
}

export function useGetIdentityWithRolesQuery(
	tenantId: string,
	id: string,
	options?: { enabled?: boolean },
) {
	return useQuery({
		queryKey: ["identities", tenantId, id, "roles"],
		queryFn: () => getIdentityWithRolesFn(tenantId, id),
		enabled: (options?.enabled ?? true) && !!tenantId && !!id,
	});
}
