import {
	type CreatePolicyInput,
	type Policy,
	PolicySchema,
} from "@r6/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export async function createPolicyFn(
	tenantId: string,
	body: CreatePolicyInput,
): Promise<Policy> {
	const { data } = await identityApi.post<unknown>(
		`/tenants/${tenantId}/policies`,
		body,
	);
	return PolicySchema.parse(data);
}

export function useCreatePolicyMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			tenantId,
			body,
		}: { tenantId: string; body: CreatePolicyInput }) =>
			createPolicyFn(tenantId, body),
		onSuccess: (_data, { tenantId }) => {
			queryClient.invalidateQueries({ queryKey: ["policies", tenantId] });
		},
	});
}
