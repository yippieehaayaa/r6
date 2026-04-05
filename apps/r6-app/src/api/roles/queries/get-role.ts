import { type Role, RoleSchema } from "@r6/schemas";
import { useQuery } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export async function getRoleFn(tenantSlug: string, id: string): Promise<Role> {
	const { data } = await identityApi.get<unknown>(
		`/tenants/${tenantSlug}/roles/${id}`,
	);
	return RoleSchema.parse(data);
}

export function useGetRoleQuery(tenantSlug: string, id: string) {
	return useQuery({
		queryKey: ["roles", tenantSlug, id],
		queryFn: () => getRoleFn(tenantSlug, id),
		enabled: !!tenantSlug && !!id,
	});
}
