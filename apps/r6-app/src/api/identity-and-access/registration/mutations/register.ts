import {
	type RegisterInput,
	type RegisterResponse,
	RegisterResponseSchema,
} from "@r6/schemas";
import { useMutation } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export async function registerFn(
	input: RegisterInput,
): Promise<RegisterResponse> {
	const { data } = await identityApi.post<unknown>("/registration", input);
	return RegisterResponseSchema.parse(data);
}

export function useRegisterMutation() {
	return useMutation({ mutationFn: registerFn });
}
