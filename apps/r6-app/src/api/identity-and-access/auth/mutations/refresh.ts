import { type RefreshResponse, RefreshResponseSchema } from "@r6/schemas";
import { useMutation } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export async function refreshFn(): Promise<RefreshResponse> {
	const { data } = await identityApi.post<unknown>("/auth/refresh");
	return RefreshResponseSchema.parse(data);
}

export function useRefreshMutation() {
	return useMutation({
		mutationFn: refreshFn,
	});
}
