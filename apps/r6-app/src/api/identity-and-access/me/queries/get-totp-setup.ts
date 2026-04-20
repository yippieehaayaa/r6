import { type TotpSetupResponse, TotpSetupResponseSchema } from "@r6/schemas";
import { useQuery } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export async function getTotpSetupFn(): Promise<TotpSetupResponse> {
	const { data } = await identityApi.get<unknown>("/me/totp/setup");
	return TotpSetupResponseSchema.parse(data);
}

/**
 * Fetches TOTP setup data (secret, URI, QR code) on demand.
 * Disabled by default — pass `enabled: true` to trigger the request.
 * staleTime and gcTime are set to 0 because the server generates a new
 * secret on every call; cached data would show a stale QR code.
 */
export function useGetTotpSetupQuery(options?: { enabled?: boolean }) {
	return useQuery({
		queryKey: ["me", "totp-setup"],
		queryFn: getTotpSetupFn,
		enabled: options?.enabled ?? false,
		staleTime: 0,
		gcTime: 0,
	});
}
