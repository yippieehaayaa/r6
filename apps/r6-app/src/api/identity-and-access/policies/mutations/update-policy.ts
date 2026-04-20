import { type Policy, PolicySchema, type UpdatePolicyInput } from "@r6/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export async function updatePolicyFn(
	tenantId: string,
	id: string,
	body: UpdatePolicyInput,
): Promise<Policy> {
	const { data } = await identityApi.patch<unknown>(
		`/tenants/${tenantId}/policies/${id}`,
		body,
	);
	return PolicySchema.parse(data);
}

export function useUpdatePolicyMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			tenantId,
			id,
			body,
		}: {
			tenantId: string;
			id: string;
			body: UpdatePolicyInput;
		}) => updatePolicyFn(tenantId, id, body),
		onSuccess: (_data, { tenantId, id }) => {
			queryClient.invalidateQueries({ queryKey: ["policies", tenantId] });
			queryClient.invalidateQueries({ queryKey: ["policies", tenantId, id] });
		},
	});
}
