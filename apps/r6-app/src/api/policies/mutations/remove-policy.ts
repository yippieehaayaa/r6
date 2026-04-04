import { useMutation } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export interface RemovePolicyParams {
	id: string;
}

export async function removePolicyFn({
	id,
}: RemovePolicyParams): Promise<void> {
	await identityApi.delete(`/policies/${id}`);
}

export function useRemovePolicyMutation() {
	return useMutation({
		mutationFn: removePolicyFn,
	});
}
