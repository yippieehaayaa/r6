import { type IdentitySafe, IdentitySafeSchema } from "@r6/schemas";
import { useMutation } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export interface AssignRoleParams {
	tenantId: string;
	id: string;
	roleId: string;
}

export async function assignRoleFn({
	tenantId,
	id,
	roleId,
}: AssignRoleParams): Promise<IdentitySafe> {
	const { data } = await identityApi.post<unknown>(
		`/tenants/${tenantId}/identities/${id}/roles`,
		{ roleId },
	);
	return IdentitySafeSchema.parse(data);
}

export function useAssignRoleMutation() {
	return useMutation({
		mutationFn: assignRoleFn,
	});
}
