import {
	type AcceptInvitationInput,
	type AcceptInvitationResponse,
	AcceptInvitationResponseSchema,
	AcceptInvitationSchema,
} from "@r6/schemas";
import { useMutation } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export async function acceptInvitationFn(
	input: AcceptInvitationInput,
): Promise<AcceptInvitationResponse> {
	const body = AcceptInvitationSchema.parse(input);
	const { data } = await identityApi.post<unknown>("/invitations/accept", body);
	return AcceptInvitationResponseSchema.parse(data);
}

export function useAcceptInvitationMutation() {
	return useMutation({
		mutationFn: acceptInvitationFn,
	});
}
