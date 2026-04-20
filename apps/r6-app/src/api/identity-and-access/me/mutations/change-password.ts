import {
	type ChangePasswordInput,
	type ChangePasswordResponse,
	ChangePasswordResponseSchema,
	ChangePasswordSchema,
} from "@r6/schemas";
import { useMutation } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export async function changePasswordFn(
	input: ChangePasswordInput,
): Promise<ChangePasswordResponse> {
	const body = ChangePasswordSchema.parse(input);
	const { data } = await identityApi.patch<unknown>("/me/password", body);
	return ChangePasswordResponseSchema.parse(data);
}

export function useChangePasswordMutation() {
	return useMutation({
		mutationFn: changePasswordFn,
	});
}
