import { type TotpSetupResponse, TotpSetupResponseSchema } from "@r6/schemas";
import { useQuery } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export async function getTotpSetupFn(): Promise<TotpSetupResponse> {
	const { data } = await identityApi.get<unknown>("/me/totp/setup");
	return TotpSetupResponseSchema.parse(data);
}

export function useGetTotpSetupQuery(options?: { enabled?: boolean }) {
	return useQuery({
		queryKey: ["me", "totp", "setup"],
		queryFn: getTotpSetupFn,
		// Disabled by default — GET /me/totp/setup generates + stores a new
		// encrypted secret on every call. Only fetch when the user explicitly
		// initiates the TOTP setup flow.
		enabled: options?.enabled ?? false,
		// Never serve a stale QR code from cache — always request a fresh secret.
		staleTime: 0,
		gcTime: 0,
	});
}
