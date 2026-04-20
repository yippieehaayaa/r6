import {
	type CreateInvitationInput,
	type InvitationSafe,
	InvitationSafeSchema,
} from "@r6/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export interface InviteParams {
	tenantId: string;
	body: CreateInvitationInput;
}

export async function inviteFn({
	tenantId,
	body,
}: InviteParams): Promise<InvitationSafe> {
	const { data } = await identityApi.post<unknown>(
		`/tenants/${tenantId}/invitations`,
		body,
	);
	return InvitationSafeSchema.parse(data);
}

export function useInviteMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: inviteFn,
		onSuccess: (_data, { tenantId }) => {
			queryClient.invalidateQueries({ queryKey: ["invitations", tenantId] });
		},
	});
}
