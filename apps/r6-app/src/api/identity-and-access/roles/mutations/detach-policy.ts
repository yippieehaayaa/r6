import { type Role, RoleSchema } from "@r6/schemas";
import { useMutation } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export interface DetachPolicyParams {
	tenantId: string;
	id: string;
	policyId: string;
}

export async function detachPolicyFn({
	tenantId,
	id,
	policyId,
}: DetachPolicyParams): Promise<Role> {
	const { data } = await identityApi.delete<unknown>(
		`/tenants/${tenantId}/roles/${id}/policies/${policyId}`,
	);
	return RoleSchema.parse(data);
}

export function useDetachPolicyMutation() {
	return useMutation({
		mutationFn: detachPolicyFn,
	});
}
