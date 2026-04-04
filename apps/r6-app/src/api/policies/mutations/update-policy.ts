import { type Policy, PolicySchema, type UpdatePolicyInput } from "@r6/schemas";
import { useMutation } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export interface UpdatePolicyParams {
	id: string;
	body: UpdatePolicyInput;
}

export async function updatePolicyFn({
	id,
	body,
}: UpdatePolicyParams): Promise<Policy> {
	const { data } = await identityApi.patch<unknown>(`/policies/${id}`, body);
	return PolicySchema.parse(data);
}

export function useUpdatePolicyMutation() {
	return useMutation({
		mutationFn: updatePolicyFn,
	});
}
