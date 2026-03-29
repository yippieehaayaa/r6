import { type Policy, PolicySchema } from "@r6/schemas";
import { useMutation } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export interface RestorePolicyParams {
	tenantSlug: string;
	id: string;
}

export async function restorePolicyFn({
	tenantSlug,
	id,
}: RestorePolicyParams): Promise<Policy> {
	const { data } = await identityApi.post<unknown>(
		`/tenants/${tenantSlug}/policies/${id}/restore`,
	);
	return PolicySchema.parse(data);
}

export function useRestorePolicyMutation() {
	return useMutation({
		mutationFn: restorePolicyFn,
	});
}
