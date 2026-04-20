import {
	type CreateRoleInput,
	type Role,
	RoleSchema,
} from "@r6/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export async function createRoleFn(
	tenantId: string,
	body: CreateRoleInput,
): Promise<Role> {
	const { data } = await identityApi.post<unknown>(
		`/tenants/${tenantId}/roles`,
		body,
	);
	return RoleSchema.parse(data);
}

export function useCreateRoleMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ tenantId, body }: { tenantId: string; body: CreateRoleInput }) =>
			createRoleFn(tenantId, body),
		onSuccess: (_data, { tenantId }) => {
			queryClient.invalidateQueries({ queryKey: ["roles", tenantId] });
		},
	});
}
