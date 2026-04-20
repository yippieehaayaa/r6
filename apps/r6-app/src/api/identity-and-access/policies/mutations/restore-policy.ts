import { type Policy, PolicySchema } from "@r6/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export async function restorePolicyFn(
	tenantId: string,
	id: string,
): Promise<Policy> {
	const { data } = await identityApi.post<unknown>(
		`/tenants/${tenantId}/policies/${id}/restore`,
	);
	return PolicySchema.parse(data);
}

export function useRestorePolicyMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ tenantId, id }: { tenantId: string; id: string }) =>
			restorePolicyFn(tenantId, id),
		onSuccess: (_data, { tenantId }) => {
			queryClient.invalidateQueries({ queryKey: ["policies", tenantId] });
		},
	});
}
