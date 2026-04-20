import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { identityApi } from "@/api/_app";

export interface SetIdentityPoliciesParams {
	tenantId: string;
	id: string;
	policyIds: string[];
}

const SetPoliciesResponseSchema = z.object({ message: z.string() });

export async function setIdentityPoliciesFn({
	tenantId,
	id,
	policyIds,
}: SetIdentityPoliciesParams): Promise<{ message: string }> {
	const { data } = await identityApi.put<unknown>(
		`/tenants/${tenantId}/identities/${id}/roles`,
		{ policyIds },
	);
	return SetPoliciesResponseSchema.parse(data);
}

export function useSetIdentityPoliciesMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: setIdentityPoliciesFn,
		onSuccess: (_data, { tenantId, id }) => {
			queryClient.invalidateQueries({ queryKey: ["identities", tenantId, id] });
		},
	});
}
