import {
	type IdentitySafe,
	IdentitySafeSchema,
	PaginatedResponseSchema,
} from "@r6/schemas";
import { useQuery } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export interface ListIdentitiesParams {
	page?: number;
	limit?: number;
	search?: string;
}

const ListIdentitiesResponseSchema =
	PaginatedResponseSchema(IdentitySafeSchema);

export async function listIdentitiesFn(
	tenantSlug: string,
	params: ListIdentitiesParams = {},
): Promise<{
	data: IdentitySafe[];
	page: number;
	limit: number;
	total: number;
}> {
	const { data } = await identityApi.get<unknown>(
		`/tenants/${tenantSlug}/identities`,
		{ params },
	);
	return ListIdentitiesResponseSchema.parse(data);
}

export function useListIdentitiesQuery(
	tenantSlug: string,
	params: ListIdentitiesParams = {},
	options?: { staleTime?: number; gcTime?: number },
) {
	return useQuery({
		queryKey: ["identities", tenantSlug, params],
		queryFn: () => listIdentitiesFn(tenantSlug, params),
		enabled: !!tenantSlug,
		...options,
	});
}
