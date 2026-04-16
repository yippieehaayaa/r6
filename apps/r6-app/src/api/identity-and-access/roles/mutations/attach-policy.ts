import { type Role, RoleSchema } from "@r6/schemas";
import { useMutation } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export interface AttachPolicyParams {
	tenantSlug: string;
	id: string;
	policyId: string;
}

export async function attachPolicyFn({
	tenantSlug,
	id,
	policyId,
}: AttachPolicyParams): Promise<Role> {
	const { data } = await identityApi.post<unknown>(
		`/tenants/${tenantSlug}/roles/${id}/policies`,
		{ policyId },
	);
	return RoleSchema.parse(data);
}

export function useAttachPolicyMutation() {
	return useMutation({
		mutationFn: attachPolicyFn,
	});
}
