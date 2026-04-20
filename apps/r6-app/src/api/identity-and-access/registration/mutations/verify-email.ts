import {
	type VerifyEmailRequestInput,
	VerifyEmailRequestSchema,
	type VerifyEmailResponse,
	VerifyEmailResponseSchema,
} from "@r6/schemas";
import { useMutation } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export async function verifyEmailFn(
	input: VerifyEmailRequestInput,
): Promise<VerifyEmailResponse> {
	const body = VerifyEmailRequestSchema.parse(input);
	const { data } = await identityApi.post<unknown>(
		"/registration/verify-email",
		body,
	);
	return VerifyEmailResponseSchema.parse(data);
}

export function useVerifyEmailMutation() {
	return useMutation({
		mutationFn: verifyEmailFn,
	});
}
