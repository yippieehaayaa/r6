import {
	type LoginRequestInput,
	LoginRequestSchema,
	type LoginResponse,
	LoginResponseSchema,
} from "@r6/schemas";
import { useMutation } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export async function loginFn(
	input: LoginRequestInput,
): Promise<LoginResponse> {
	const body = LoginRequestSchema.parse(input);
	const { data } = await identityApi.post<unknown>("/auth/login", body);
	return LoginResponseSchema.parse(data);
}

export function useLoginMutation() {
	return useMutation({
		mutationFn: loginFn,
	});
}
