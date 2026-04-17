import { useMutation } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export interface RemoveRoleParams {
	tenantId: string;
	id: string;
}

export async function removeRoleFn({
	tenantId,
	id,
}: RemoveRoleParams): Promise<void> {
	await identityApi.delete(`/tenants/${tenantId}/roles/${id}`);
}

export function useRemoveRoleMutation() {
	return useMutation({
		mutationFn: removeRoleFn,
	});
}
