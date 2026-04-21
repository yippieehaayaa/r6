import {
	type IdentitySafe,
	IdentitySafeSchema,
	type UpdateProfileInput,
	UpdateProfileSchema,
} from "@r6/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export async function updateProfileFn(
	input: UpdateProfileInput,
): Promise<IdentitySafe> {
	const body = UpdateProfileSchema.parse(input);
	const { data } = await identityApi.patch<unknown>("/me", body);
	return IdentitySafeSchema.parse(data);
}

export function useUpdateProfileMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: updateProfileFn,
		onSuccess: (updated) => {
			queryClient.setQueryData(["me"], updated);
		},
	});
}
