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
}

const ListPoliciesResponseSchema = PaginatedResponseSchema(PolicySchema);

export async function listPoliciesFn(
	params: ListPoliciesParams = {},
): Promise<{ data: Policy[]; page: number; limit: number; total: number }> {
	const { data } = await identityApi.get<unknown>("/policies", { params });
	return ListPoliciesResponseSchema.parse(data);
}

export function useListPoliciesQuery(
	params: ListPoliciesParams = {},
	options?: { staleTime?: number; gcTime?: number },
) {
	return useQuery({
		queryKey: ["policies", params],
		queryFn: () => listPoliciesFn(params),
		...options,
	});
}
