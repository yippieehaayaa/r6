import {
	type LoginRequestInput,
	type LoginResponse,
	LoginResponseSchema,
} from "@r6/schemas";
import { useMutation } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export async function loginFn(
	input: LoginRequestInput,
): Promise<LoginResponse> {
	const { data } = await identityApi.post<unknown>("/auth/login", input);
	return LoginResponseSchema.parse(data);
}

export function useLoginMutation() {
	return useMutation({
		mutationFn: loginFn,
	});
}
