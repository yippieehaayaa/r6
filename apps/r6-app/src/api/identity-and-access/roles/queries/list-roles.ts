import {
	type Role,
	RoleSchema,
	PaginatedResponseSchema,
} from "@r6/schemas";
import { useQuery } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export interface ListRolesParams {
	page?: number;
	limit?: number;
	search?: string;
}

const ListRolesResponseSchema = PaginatedResponseSchema(RoleSchema);

export async function listRolesFn(
	tenantId: string,
	params: ListRolesParams = {},
): Promise<{ data: Role[]; page: number; limit: number; total: number }> {
	const { data } = await identityApi.get<unknown>(
		`/tenants/${tenantId}/roles`,
		{ params },
	);
	return ListRolesResponseSchema.parse(data);
}

export function useListRolesQuery(
	tenantId: string,
	params: ListRolesParams = {},
	options?: { staleTime?: number; gcTime?: number; enabled?: boolean },
) {
	return useQuery({
		queryKey: ["roles", tenantId, params],
		queryFn: () => listRolesFn(tenantId, params),
		enabled: (options?.enabled ?? true) && !!tenantId,
		...options,
	});
}
