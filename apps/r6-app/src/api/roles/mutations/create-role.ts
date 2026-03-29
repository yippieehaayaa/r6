import {
	type CreateRoleInput,
	CreateRoleSchema,
	type Role,
	RoleSchema,
} from "@r6/schemas";
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
	const parsed = CreateRoleSchema.parse(body);
	const { data } = await identityApi.post<unknown>(
		`/tenants/${tenantSlug}/roles`,
		parsed,
	);
	return RoleSchema.parse(data);
}

export function useCreateRoleMutation() {
	return useMutation({
		mutationFn: createRoleFn,
	});
}
