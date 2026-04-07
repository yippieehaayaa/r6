import { useMutation } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export async function disableTotpFn(): Promise<void> {
	await identityApi.delete("/me/totp/disable");
}

export function useDisableTotpMutation() {
	return useMutation({ mutationFn: disableTotpFn });
}
