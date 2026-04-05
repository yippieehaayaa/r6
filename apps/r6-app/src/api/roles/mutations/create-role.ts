import { type CreateRoleInput, type Role, RoleSchema } from "@r6/schemas";
import { useMutation } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export interface CreateRoleParams {
	tenantSlug: string;
	body: CreateRoleInput;
}

export async function createRoleFn({
	tenantSlug,
	body,
}: CreateRoleParams): Promise<Role> {
	const { data } = await identityApi.post<unknown>(
		`/tenants/${tenantSlug}/roles`,
		body,
	);
	return RoleSchema.parse(data);
}

export function useCreateRoleMutation() {
	return useMutation({
		mutationFn: createRoleFn,
	});
}
