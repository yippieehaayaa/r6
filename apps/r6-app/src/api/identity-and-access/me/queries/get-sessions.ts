import { SessionsResponseSchema } from "@r6/schemas";
import { useQuery } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export async function getSessionsFn() {
	const { data } = await identityApi.get<unknown>("/me/sessions");
	return SessionsResponseSchema.parse(data);
}

export function useGetSessionsQuery(options?: { staleTime?: number }) {
	return useQuery({
		queryKey: ["me", "sessions"],
		queryFn: getSessionsFn,
		staleTime: options?.staleTime ?? 30 * 1000,
	});
}
