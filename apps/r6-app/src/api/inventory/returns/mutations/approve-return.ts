import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

export interface ApproveReturnParams {
	tenantId: string;
	returnRequestId: string;
}

export async function approveReturnFn({
	tenantId,
	returnRequestId,
}: ApproveReturnParams): Promise<unknown> {
	const { data } = await inventoryApi.post<unknown>(
		`/tenants/${tenantId}/returns/${returnRequestId}/approve`,
	);
	return data;
}

export function useApproveReturnMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: approveReturnFn,
		onSuccess: (_data, { tenantId, returnRequestId }) => {
			queryClient.invalidateQueries({ queryKey: ["returns", tenantId] });
			queryClient.invalidateQueries({
				queryKey: ["return", tenantId, returnRequestId],
			});
		},
	});
}
