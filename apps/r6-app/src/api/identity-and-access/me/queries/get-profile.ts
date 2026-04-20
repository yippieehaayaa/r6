import { type IdentitySafe, IdentitySafeSchema } from "@r6/schemas";
import { useQuery } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export async function getProfileFn(): Promise<IdentitySafe> {
	const { data } = await identityApi.get<unknown>("/me");
	return IdentitySafeSchema.parse(data);
}

export function useGetProfileQuery() {
	return useQuery({
		queryKey: ["me"],
		queryFn: getProfileFn,
	});
}
