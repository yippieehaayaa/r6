import {
	type TotpDisableRequestInput,
	TotpDisableRequestSchema,
	type TotpDisableResponse,
	TotpDisableResponseSchema,
} from "@r6/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export async function disableTotpFn(
	input: TotpDisableRequestInput,
): Promise<TotpDisableResponse> {
	const body = TotpDisableRequestSchema.parse(input);
	const { data } = await identityApi.delete<unknown>("/me/totp", {
		data: body,
	});
	return TotpDisableResponseSchema.parse(data);
}

export function useDisableTotpMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: disableTotpFn,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["me"] });
		},
	});
}
