import {
	type CreateInvitationInput,
	CreateInvitationSchema,
	type InvitationSafe,
	InvitationSafeSchema,
} from "@r6/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export async function inviteFn(
	tenantId: string,
	input: CreateInvitationInput,
): Promise<InvitationSafe> {
	const body = CreateInvitationSchema.parse(input);
	const { data } = await identityApi.post<unknown>(
		`/tenants/${tenantId}/invitations`,
		body,
	);
	return InvitationSafeSchema.parse(data);
}

export function useInviteMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			tenantId,
			input,
		}: {
			tenantId: string;
			input: CreateInvitationInput;
		}) => inviteFn(tenantId, input),
		onSuccess: (_data, { tenantId }) => {
			queryClient.invalidateQueries({ queryKey: ["invitations", tenantId] });
		},
	});
}
