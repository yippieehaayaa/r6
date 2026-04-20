import {
	PaginatedResponseSchema,
	type Policy,
	PolicySchema,
} from "@r6/schemas";
import { useQuery } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export interface ListPoliciesParams {
	page?: number;
	limit?: number;
	search?: string;
	isManaged?: boolean;
}

const ListPoliciesResponseSchema = PaginatedResponseSchema(PolicySchema);

export async function listPoliciesFn(
	tenantId: string,
	params: ListPoliciesParams = {},
): Promise<{ data: Policy[]; page: number; limit: number; total: number }> {
	const { data } = await identityApi.get<unknown>(
		`/tenants/${tenantId}/policies`,
		{ params },
	);
	return ListPoliciesResponseSchema.parse(data);
}

export function useListPoliciesQuery(
	tenantId: string,
	params: ListPoliciesParams = {},
	options?: { staleTime?: number; gcTime?: number; enabled?: boolean },
) {
	return useQuery({
		queryKey: ["policies", tenantId, params],
		queryFn: () => listPoliciesFn(tenantId, params),
		enabled: (options?.enabled ?? true) && !!tenantId,
		...options,
	});
}
