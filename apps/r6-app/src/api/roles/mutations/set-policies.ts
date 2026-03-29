import {
	type AssignPoliciesToRoleInput,
	AssignPoliciesToRoleSchema,
	type Role,
	RoleSchema,
} from "@r6/schemas";
import { useMutation } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export interface SetPoliciesParams {
	tenantSlug: string;
	id: string;
	body: AssignPoliciesToRoleInput;
}

export async function setPoliciesFn({
	tenantSlug,
	id,
	body,
}: SetPoliciesParams): Promise<Role> {
	const parsed = AssignPoliciesToRoleSchema.parse(body);
	const { data } = await identityApi.put<unknown>(
		`/tenants/${tenantSlug}/roles/${id}/policies`,
		parsed,
	);
	return RoleSchema.parse(data);
}

export function useSetPoliciesMutation() {
	return useMutation({
		mutationFn: setPoliciesFn,
	});
}
