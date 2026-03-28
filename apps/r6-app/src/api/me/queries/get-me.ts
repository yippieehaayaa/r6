import { type IdentitySafe, IdentitySafeSchema } from "@r6/schemas";
import { identityApi } from "@/api/_app";

export async function getMeFn(): Promise<IdentitySafe> {
	const { data } = await identityApi.get<unknown>("/me");
	return IdentitySafeSchema.parse(data);
}
