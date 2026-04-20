import {
	type AcceptInvitationInput,
	IdentitySafeSchema,
	InvitationSafeSchema,
} from "@r6/schemas";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { identityApi } from "@/api/_app";

const AcceptInvitationResponseSchema = z.object({
	invitation: InvitationSafeSchema,
	identity: IdentitySafeSchema,
});

export type AcceptInvitationResponse = z.infer<
	typeof AcceptInvitationResponseSchema
>;

export async function acceptInvitationFn(
	input: AcceptInvitationInput,
): Promise<AcceptInvitationResponse> {
	const { data } = await identityApi.post<unknown>(
		"/invitations/accept",
		input,
	);
	return AcceptInvitationResponseSchema.parse(data);
}

export function useAcceptInvitationMutation() {
	return useMutation({ mutationFn: acceptInvitationFn });
}
