import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

export interface CancelReturnParams {
	tenantId: string;
	returnRequestId: string;
}

export async function cancelReturnFn({
	tenantId,
	returnRequestId,
}: CancelReturnParams): Promise<unknown> {
	const { data } = await inventoryApi.post<unknown>(
		`/tenants/${tenantId}/returns/${returnRequestId}/cancel`,
		{},
	);
	return data;
}

export function useCancelReturnMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: cancelReturnFn,
		onSuccess: (_data, { tenantId, returnRequestId }) => {
			queryClient.invalidateQueries({ queryKey: ["returns", tenantId] });
			queryClient.invalidateQueries({
				queryKey: ["return", tenantId, returnRequestId],
			});
		},
	});
}
