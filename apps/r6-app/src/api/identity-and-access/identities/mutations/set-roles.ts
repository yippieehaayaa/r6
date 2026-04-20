import { type IdentitySafe, IdentitySafeSchema } from "@r6/schemas";
import { useMutation } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export interface SetRolesParams {
	tenantId: string;
	id: string;
	roleIds: string[];
}

export async function setRolesFn({
	tenantId,
	id,
	roleIds,
}: SetRolesParams): Promise<IdentitySafe> {
	const { data } = await identityApi.put<unknown>(
		`/tenants/${tenantId}/identities/${id}/roles`,
		{ roleIds },
	);
	return IdentitySafeSchema.parse(data);
}

export function useSetRolesMutation() {
	return useMutation({
		mutationFn: setRolesFn,
	});
}
