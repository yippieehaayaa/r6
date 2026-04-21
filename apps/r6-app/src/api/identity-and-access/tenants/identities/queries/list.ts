import {
	type IdentityListItem,
	IdentityListItemSchema,
	type ListIdentitiesQuery,
	type PaginatedResponse,
	PaginatedResponseSchema,
} from "@r6/schemas";
import { useQuery } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export async function listIdentitiesFn(
	tenantId: string,
	params: ListIdentitiesQuery,
): Promise<PaginatedResponse<IdentityListItem>> {
	const { data } = await identityApi.get<unknown>(
		`/tenants/${tenantId}/identities`,
		{ params },
	);
	return PaginatedResponseSchema(IdentityListItemSchema).parse(data);
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
