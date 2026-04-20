import {
	type RegisterInput,
	type RegisterResponse,
	RegisterResponseSchema,
	RegisterSchema,
} from "@r6/schemas";
import { useMutation } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export async function registerFn(
	input: RegisterInput,
): Promise<RegisterResponse> {
	const body = RegisterSchema.parse(input);
	const { data } = await identityApi.post<unknown>("/registration", body);
	return RegisterResponseSchema.parse(data);
}

export function useRegisterMutation() {
	return useMutation({
		mutationFn: registerFn,
	});
}
