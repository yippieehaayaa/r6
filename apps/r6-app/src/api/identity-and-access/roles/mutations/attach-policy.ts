import { type Role, RoleSchema } from "@r6/schemas";
import { useMutation } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export interface AttachPolicyParams {
	tenantId: string;
	id: string;
	policyId: string;
}

export async function attachPolicyFn({
	tenantId,
	id,
	policyId,
}: AttachPolicyParams): Promise<Role> {
	const { data } = await identityApi.post<unknown>(
		`/tenants/${tenantId}/roles/${id}/policies`,
		{ policyId },
	);
	return RoleSchema.parse(data);
}

export function useAttachPolicyMutation() {
	return useMutation({
		mutationFn: attachPolicyFn,
	});
}
