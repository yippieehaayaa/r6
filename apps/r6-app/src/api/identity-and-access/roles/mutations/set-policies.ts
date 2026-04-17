import {
	type AssignPoliciesToRoleInput,
	type Role,
	RoleSchema,
} from "@r6/schemas";
import { useMutation } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export interface SetPoliciesParams {
	tenantId: string;
	id: string;
	body: AssignPoliciesToRoleInput;
}

export async function setPoliciesFn({
	tenantId,
	id,
	body,
}: SetPoliciesParams): Promise<Role> {
	const { data } = await identityApi.put<unknown>(
		`/tenants/${tenantId}/roles/${id}/policies`,
		body,
	);
	return RoleSchema.parse(data);
}

export function useSetPoliciesMutation() {
	return useMutation({
		mutationFn: setPoliciesFn,
	});
}
