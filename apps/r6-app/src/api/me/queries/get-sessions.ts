import { type SessionsResponse, SessionsResponseSchema } from "@r6/schemas";
import { useQuery } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export async function getSessionsFn(): Promise<SessionsResponse> {
	const { data } = await identityApi.get<unknown>("/me/sessions");
	return SessionsResponseSchema.parse(data);
}

export function useGetSessionsQuery() {
	return useQuery({
		queryKey: ["me", "sessions"],
		queryFn: getSessionsFn,
	});
}
