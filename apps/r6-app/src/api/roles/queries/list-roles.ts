import { PaginatedResponseSchema, type Role, RoleSchema } from "@r6/schemas";
import { useQuery } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export interface ListRolesParams {
	page?: number;
	limit?: number;
	search?: string;
}

const ListRolesResponseSchema = PaginatedResponseSchema(RoleSchema);

export async function listRolesFn(
	tenantSlug: string,
	params: ListRolesParams = {},
): Promise<{ data: Role[]; page: number; limit: number; total: number }> {
	const { data } = await identityApi.get<unknown>(
		`/tenants/${tenantSlug}/roles`,
		{ params },
	);
	return ListRolesResponseSchema.parse(data);
}

export function useListRolesQuery(
	tenantSlug: string,
	params: ListRolesParams = {},
	options?: { staleTime?: number; gcTime?: number; enabled?: boolean },
) {
	return useQuery({
		queryKey: ["roles", tenantSlug, params],
		queryFn: () => listRolesFn(tenantSlug, params),
		enabled: !!tenantSlug,
		...options,
	});
}
