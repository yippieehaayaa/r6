import type { TotpDisableRequestInput } from "@r6/schemas";
import { useMutation } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export async function disableTotpFn(
	body: TotpDisableRequestInput,
): Promise<void> {
	await identityApi.delete("/me/totp", { data: body });
}

export function useDisableTotpMutation() {
	return useMutation({ mutationFn: disableTotpFn });
}
