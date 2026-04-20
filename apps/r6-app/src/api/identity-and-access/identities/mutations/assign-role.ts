import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { identityApi } from "@/api/_app";

export interface AssignIdentityPolicyParams {
	tenantId: string;
	id: string;
	policyId: string;
}

const AssignPolicyResponseSchema = z.object({ message: z.string() });

export async function assignIdentityPolicyFn({
	tenantId,
	id,
	policyId,
}: AssignIdentityPolicyParams): Promise<{ message: string }> {
	const { data } = await identityApi.post<unknown>(
		`/tenants/${tenantId}/identities/${id}/roles`,
		{ policyId },
	);
	return AssignPolicyResponseSchema.parse(data);
}

export function useAssignIdentityPolicyMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: assignIdentityPolicyFn,
		onSuccess: (_data, { tenantId, id }) => {
			queryClient.invalidateQueries({ queryKey: ["identities", tenantId, id] });
		},
	});
}
