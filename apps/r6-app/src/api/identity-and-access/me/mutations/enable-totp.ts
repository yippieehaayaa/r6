import type { TotpEnableRequestInput } from "@r6/schemas";
import { useMutation } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export async function enableTotpFn(
	body: TotpEnableRequestInput,
): Promise<void> {
	await identityApi.post("/me/totp/enable", body);
}

export function useEnableTotpMutation() {
	return useMutation({ mutationFn: enableTotpFn });
}
