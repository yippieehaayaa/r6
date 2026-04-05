import { type LogoutResponse, LogoutResponseSchema } from "@r6/schemas";
import { useMutation } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export interface LogoutInput {
	accessToken: string;
}

export async function logoutFn({
	accessToken,
}: LogoutInput): Promise<LogoutResponse> {
	const { data } = await identityApi.post<unknown>(
		"/auth/logout",
		{},
		{ headers: { Authorization: `Bearer ${accessToken}` } },
	);
	return LogoutResponseSchema.parse(data);
}

export function useLogoutMutation() {
	return useMutation({
		mutationFn: logoutFn,
	});
}
