import {
	type InvitationSafe,
	InvitationSafeSchema,
	PaginatedResponseSchema,
} from "@r6/schemas";
import { useQuery } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export interface ListInvitationsParams {
	page?: number;
	limit?: number;
	includeAccepted?: boolean;
}

const ListInvitationsResponseSchema =
	PaginatedResponseSchema(InvitationSafeSchema);

export async function listInvitationsFn(
	tenantId: string,
	params: ListInvitationsParams = {},
): Promise<{
	data: InvitationSafe[];
	page: number;
	limit: number;
	total: number;
}> {
	const { data } = await identityApi.get<unknown>(
		`/tenants/${tenantId}/invitations`,
		{ params },
	);
	return ListInvitationsResponseSchema.parse(data);
}

export function useListInvitationsQuery(
	tenantId: string,
	params: ListInvitationsParams = {},
	options?: { staleTime?: number; gcTime?: number; enabled?: boolean },
) {
	return useQuery({
		queryKey: ["invitations", tenantId, params],
		queryFn: () => listInvitationsFn(tenantId, params),
		enabled: (options?.enabled ?? true) && !!tenantId,
		...options,
	});
}
