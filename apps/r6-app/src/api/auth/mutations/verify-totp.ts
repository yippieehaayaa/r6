import {
	type TotpVerifyRequestInput,
	type TotpVerifyResponse,
	TotpVerifyResponseSchema,
} from "@r6/schemas";
import { useMutation } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export async function verifyTotpFn(
	input: TotpVerifyRequestInput,
): Promise<TotpVerifyResponse> {
	const { data } = await identityApi.post<unknown>("/auth/totp/verify", input);
	return TotpVerifyResponseSchema.parse(data);
}

export function useVerifyTotpMutation() {
	return useMutation({ mutationFn: verifyTotpFn });
}
