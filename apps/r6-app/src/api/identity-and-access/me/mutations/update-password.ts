import type { ChangePasswordInput } from "@r6/schemas";
import { useMutation } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export async function updatePasswordFn(
	body: ChangePasswordInput,
): Promise<void> {
	await identityApi.patch("/me/password", body);
}

export function useUpdatePasswordMutation() {
	return useMutation({ mutationFn: updatePasswordFn });
}
