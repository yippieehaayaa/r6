import { type Role, RoleSchema, type UpdateRoleInput } from "@r6/schemas";
import { useMutation } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export interface UpdateRoleParams {
	tenantSlug: string;
	id: string;
	body: UpdateRoleInput;
}

export async function updateRoleFn({
	tenantSlug,
	id,
	body,
}: UpdateRoleParams): Promise<Role> {
	const { data } = await identityApi.patch<unknown>(
		`/tenants/${tenantSlug}/roles/${id}`,
		body,
	);
	return RoleSchema.parse(data);
}

export function useUpdateRoleMutation() {
	return useMutation({
		mutationFn: updateRoleFn,
	});
}
