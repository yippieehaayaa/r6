import {
	type IdentitySafe,
	IdentitySafeSchema,
	type ListIdentitiesQuery,
	type PaginatedResponse,
	PaginatedResponseSchema,
} from "@r6/schemas";
import { useQuery } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export async function listIdentitiesFn(
	tenantId: string,
	params: ListIdentitiesQuery,
): Promise<PaginatedResponse<IdentitySafe>> {
	const { data } = await identityApi.get<unknown>(
		`/tenants/${tenantId}/identities`,
		{ params },
	);
	return PaginatedResponseSchema(IdentitySafeSchema).parse(data);
}

export function useListIdentitiesQuery(
	tenantId: string,
	params: ListIdentitiesQuery,
) {
	return useQuery({
		queryKey: ["identities", tenantId, params],
		queryFn: () => listIdentitiesFn(tenantId, params),
	});
}
