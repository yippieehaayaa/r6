import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

export interface ApproveReturnParams {
	tenantSlug: string;
	returnRequestId: string;
}

export async function approveReturnFn({
	tenantSlug,
	returnRequestId,
}: ApproveReturnParams): Promise<unknown> {
	const { data } = await inventoryApi.post<unknown>(
		`/tenants/${tenantSlug}/returns/${returnRequestId}/approve`,
	);
	return data;
}

export function useApproveReturnMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: approveReturnFn,
		onSuccess: (_data, { tenantSlug, returnRequestId }) => {
			queryClient.invalidateQueries({ queryKey: ["returns", tenantSlug] });
			queryClient.invalidateQueries({
				queryKey: ["return", tenantSlug, returnRequestId],
			});
		},
	});
}
