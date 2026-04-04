import {
	PaginatedResponseSchema,
	type Tenant,
	TenantSchema,
} from "@r6/schemas";
import { useQuery } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export interface ListTenantsParams {
	page?: number;
	limit?: number;
	isActive?: boolean;
}

const ListTenantsResponseSchema = PaginatedResponseSchema(TenantSchema);

export async function listTenantsFn(
	params: ListTenantsParams = {},
): Promise<{ data: Tenant[]; page: number; limit: number; total: number }> {
	const { data } = await identityApi.get<unknown>("/tenants", {
		params,
	});
	return ListTenantsResponseSchema.parse(data);
}

export function useListTenantsQuery(
	params: ListTenantsParams = {},
	options?: { staleTime?: number; gcTime?: number; enabled?: boolean },
) {
	return useQuery({
		queryKey: ["tenants", params],
		queryFn: () => listTenantsFn(params),
		...options,
	});
}
