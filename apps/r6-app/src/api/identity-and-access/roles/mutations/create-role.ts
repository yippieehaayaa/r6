import { type CreateRoleInput, type Role, RoleSchema } from "@r6/schemas";
import { useMutation } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export interface CreateRoleParams {
	tenantId: string;
	body: CreateRoleInput;
}

export async function createRoleFn({
	tenantId,
	body,
}: CreateRoleParams): Promise<Role> {
	const { data } = await identityApi.post<unknown>(
		`/tenants/${tenantId}/roles`,
		body,
	);
	return RoleSchema.parse(data);
}

export function useCreateRoleMutation() {
	return useMutation({
		mutationFn: createRoleFn,
	});
}
