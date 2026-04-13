import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

export interface CancelReturnParams {
	tenantSlug: string;
	returnRequestId: string;
}

export async function cancelReturnFn({
	tenantSlug,
	returnRequestId,
}: CancelReturnParams): Promise<unknown> {
	const { data } = await inventoryApi.post<unknown>(
		`/tenants/${tenantSlug}/returns/${returnRequestId}/cancel`,
		{},
	);
	return data;
}

export function useCancelReturnMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: cancelReturnFn,
		onSuccess: (_data, { tenantSlug, returnRequestId }) => {
			queryClient.invalidateQueries({ queryKey: ["returns", tenantSlug] });
			queryClient.invalidateQueries({
				queryKey: ["return", tenantSlug, returnRequestId],
			});
		},
	});
}
