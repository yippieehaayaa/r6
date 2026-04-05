import { type IdentitySafe, IdentitySafeSchema } from "@r6/schemas";
import { useMutation } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export interface RemoveRoleParams {
	tenantSlug: string;
	id: string;
	roleId: string;
}

export async function removeRoleFn({
	tenantSlug,
	id,
	roleId,
}: RemoveRoleParams): Promise<IdentitySafe> {
	const { data } = await identityApi.delete<unknown>(
		`/tenants/${tenantSlug}/identities/${id}/roles/${roleId}`,
	);
	return IdentitySafeSchema.parse(data);
}

export function useRemoveRoleMutation() {
	return useMutation({
		mutationFn: removeRoleFn,
	});
}
