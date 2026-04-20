import {
	type Role,
	RoleSchema,
	type UpdateRoleInput,
} from "@r6/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export async function updateRoleFn(
	tenantId: string,
	id: string,
	body: UpdateRoleInput,
): Promise<Role> {
	const { data } = await identityApi.patch<unknown>(
		`/tenants/${tenantId}/roles/${id}`,
		body,
	);
	return RoleSchema.parse(data);
}

export function useUpdateRoleMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			tenantId,
			id,
			body,
		}: { tenantId: string; id: string; body: UpdateRoleInput }) =>
			updateRoleFn(tenantId, id, body),
		onSuccess: (_data, { tenantId, id }) => {
			queryClient.invalidateQueries({ queryKey: ["roles", tenantId] });
			queryClient.invalidateQueries({ queryKey: ["roles", tenantId, id] });
		},
	});
}
