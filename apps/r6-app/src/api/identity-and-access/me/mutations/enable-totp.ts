import {
	type TotpEnableRequestInput,
	TotpEnableRequestSchema,
	type TotpEnableResponse,
	TotpEnableResponseSchema,
} from "@r6/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export async function enableTotpFn(
	input: TotpEnableRequestInput,
): Promise<TotpEnableResponse> {
	const body = TotpEnableRequestSchema.parse(input);
	const { data } = await identityApi.post<unknown>("/me/totp/enable", body);
	return TotpEnableResponseSchema.parse(data);
}

export function useEnableTotpMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: enableTotpFn,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["me"] });
		},
	});
}
