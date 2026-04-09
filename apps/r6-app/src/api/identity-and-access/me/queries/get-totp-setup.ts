import { type TotpSetupResponse, TotpSetupResponseSchema } from "@r6/schemas";
import { identityApi } from "@/api/_app";

export async function getTotpSetupFn(): Promise<TotpSetupResponse> {
	const { data } = await identityApi.get<unknown>("/me/totp/setup");
	return TotpSetupResponseSchema.parse(data);
}
