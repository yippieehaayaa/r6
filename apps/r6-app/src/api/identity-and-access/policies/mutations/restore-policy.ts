import { type Policy, PolicySchema } from "@r6/schemas";
import { useMutation } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export interface RestorePolicyParams {
	id: string;
}

export async function restorePolicyFn({
	id,
}: RestorePolicyParams): Promise<Policy> {
	const { data } = await identityApi.post<unknown>(`/policies/${id}/restore`);
	return PolicySchema.parse(data);
}

export function useRestorePolicyMutation() {
	return useMutation({
		mutationFn: restorePolicyFn,
	});
}
