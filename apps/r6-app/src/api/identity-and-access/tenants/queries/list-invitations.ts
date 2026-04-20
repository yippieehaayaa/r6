import {
	type InvitationSafe,
	InvitationSafeSchema,
	type ListInvitationsQuery,
	type PaginatedResponse,
	PaginatedResponseSchema,
} from "@r6/schemas";
import { useQuery } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export async function listInvitationsFn(
	tenantId: string,
	params: ListInvitationsQuery,
): Promise<PaginatedResponse<InvitationSafe>> {
	const { data } = await identityApi.get<unknown>(
		`/tenants/${tenantId}/invitations`,
		{ params },
	);
	return PaginatedResponseSchema(InvitationSafeSchema).parse(data);
}

export function useListInvitationsQuery(
	tenantId: string,
	params: ListInvitationsQuery,
) {
	return useQuery({
		queryKey: ["invitations", tenantId, params],
		queryFn: () => listInvitationsFn(tenantId, params),
	});
}
