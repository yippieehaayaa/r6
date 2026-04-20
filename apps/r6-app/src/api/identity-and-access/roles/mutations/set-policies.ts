import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { identityApi } from "@/api/_app";

export interface SetRolePoliciesParams {
	tenantId: string;
	roleId: string;
	policyIds: string[];
}

const SetPoliciesResponseSchema = z.object({ message: z.string() });

export async function setRolePoliciesFn({
	tenantId,
	roleId,
	policyIds,
}: SetRolePoliciesParams): Promise<{ message: string }> {
	const { data } = await identityApi.put<unknown>(
		`/tenants/${tenantId}/roles/${roleId}/policies/set`,
		{ policyIds },
	);
	return SetPoliciesResponseSchema.parse(data);
}

export function useSetPoliciesMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: setRolePoliciesFn,
		onSuccess: (_data, { tenantId, roleId }) => {
			queryClient.invalidateQueries({
				queryKey: ["roles", tenantId, roleId, "policies"],
			});
		},
	});
}
