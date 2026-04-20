import { useMutation, useQueryClient } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export async function removeRoleFn(
	tenantId: string,
	id: string,
): Promise<void> {
	await identityApi.delete(`/tenants/${tenantId}/roles/${id}`);
}

export function useRemoveRoleMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ tenantId, id }: { tenantId: string; id: string }) =>
			removeRoleFn(tenantId, id),
		onSuccess: (_data, { tenantId }) => {
			queryClient.invalidateQueries({ queryKey: ["roles", tenantId] });
		},
	});
}
