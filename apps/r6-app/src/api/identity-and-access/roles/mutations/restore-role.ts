import { type Role, RoleSchema } from "@r6/schemas";
import { useMutation } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export interface RestoreRoleParams {
	tenantId: string;
	id: string;
}

export async function restoreRoleFn({
	tenantId,
	id,
}: RestoreRoleParams): Promise<Role> {
	const { data } = await identityApi.post<unknown>(
		`/tenants/${tenantId}/roles/${id}/restore`,
	);
	return RoleSchema.parse(data);
}

export function useRestoreRoleMutation() {
	return useMutation({
		mutationFn: restoreRoleFn,
	});
}
