import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

export interface RejectReturnParams {
	tenantId: string;
	returnRequestId: string;
}

export async function rejectReturnFn({
	tenantId,
	returnRequestId,
}: RejectReturnParams): Promise<unknown> {
	const { data } = await inventoryApi.post<unknown>(
		`/tenants/${tenantId}/returns/${returnRequestId}/reject`,
		{},
	);
	return data;
}

export function useRejectReturnMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: rejectReturnFn,
		onSuccess: (_data, { tenantId, returnRequestId }) => {
			queryClient.invalidateQueries({ queryKey: ["returns", tenantId] });
			queryClient.invalidateQueries({
				queryKey: ["return", tenantId, returnRequestId],
			});
		},
	});
}
