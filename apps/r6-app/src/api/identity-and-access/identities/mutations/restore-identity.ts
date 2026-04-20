import { type IdentitySafe, IdentitySafeSchema } from "@r6/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export interface RestoreIdentityParams {
	tenantId: string;
	id: string;
}

export async function restoreIdentityFn({
	tenantId,
	id,
}: RestoreIdentityParams): Promise<IdentitySafe> {
	const { data } = await identityApi.post<unknown>(
		`/tenants/${tenantId}/identities/${id}/restore`,
	);
	return IdentitySafeSchema.parse(data);
}

export function useRestoreIdentityMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: restoreIdentityFn,
		onSuccess: (_data, { tenantId }) => {
			queryClient.invalidateQueries({ queryKey: ["identities", tenantId] });
		},
	});
}
