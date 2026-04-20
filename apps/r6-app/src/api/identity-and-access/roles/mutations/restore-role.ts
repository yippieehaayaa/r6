import { type Role, RoleSchema } from "@r6/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export async function restoreRoleFn(
	tenantId: string,
	id: string,
): Promise<Role> {
	const { data } = await identityApi.post<unknown>(
		`/tenants/${tenantId}/roles/${id}/restore`,
	);
	return RoleSchema.parse(data);
}

export function useRestoreRoleMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ tenantId, id }: { tenantId: string; id: string }) =>
			restoreRoleFn(tenantId, id),
		onSuccess: (_data, { tenantId }) => {
			queryClient.invalidateQueries({ queryKey: ["roles", tenantId] });
		},
	});
}
