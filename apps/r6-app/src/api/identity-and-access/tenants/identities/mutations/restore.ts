import { type IdentitySafe, IdentitySafeSchema } from "@r6/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export async function restoreIdentityFn(
	tenantId: string,
	id: string,
): Promise<IdentitySafe> {
	const { data } = await identityApi.post<unknown>(
		`/tenants/${tenantId}/identities/${id}/restore`,
	);
	return IdentitySafeSchema.parse(data);
}

export function useRestoreIdentityMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ tenantId, id }: { tenantId: string; id: string }) =>
			restoreIdentityFn(tenantId, id),
		onSuccess: (_data, { tenantId, id }) => {
			queryClient.invalidateQueries({ queryKey: ["identity", id] });
			queryClient.invalidateQueries({ queryKey: ["identities", tenantId] });
		},
	});
}
