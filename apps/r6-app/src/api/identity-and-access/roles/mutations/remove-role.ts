import { useMutation } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export interface RemoveRoleParams {
	tenantSlug: string;
	id: string;
}

export async function removeRoleFn({
	tenantSlug,
	id,
}: RemoveRoleParams): Promise<void> {
	await identityApi.delete(`/tenants/${tenantSlug}/roles/${id}`);
}

export function useRemoveRoleMutation() {
	return useMutation({
		mutationFn: removeRoleFn,
	});
}
