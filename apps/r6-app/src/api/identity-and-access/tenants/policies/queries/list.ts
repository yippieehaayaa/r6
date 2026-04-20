import {
	type ListPoliciesQuery,
	type PaginatedResponse,
	PaginatedResponseSchema,
	type Policy,
	PolicySchema,
} from "@r6/schemas";
import { useQuery } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export async function listPoliciesFn(
	tenantId: string,
	params: ListPoliciesQuery,
): Promise<PaginatedResponse<Policy>> {
	const { data } = await identityApi.get<unknown>(
		`/tenants/${tenantId}/policies`,
		{ params },
	);
	return PaginatedResponseSchema(PolicySchema).parse(data);
}

export function useListPoliciesQuery(
	tenantId: string,
	params: ListPoliciesQuery,
) {
	return useQuery({
		queryKey: ["policies", tenantId, params],
		queryFn: () => listPoliciesFn(tenantId, params),
	});
}
