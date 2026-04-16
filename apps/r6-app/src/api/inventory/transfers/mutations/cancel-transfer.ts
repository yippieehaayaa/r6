import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

export interface CancelTransferParams {
	tenantSlug: string;
	transferId: string;
}

export async function cancelTransferFn({
	tenantSlug,
	transferId,
}: CancelTransferParams): Promise<unknown> {
	const { data } = await inventoryApi.post<unknown>(
		`/tenants/${tenantSlug}/transfers/${transferId}/cancel`,
	);
	return data;
}

export function useCancelTransferMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: cancelTransferFn,
		onSuccess: (_data, { tenantSlug, transferId }) => {
			queryClient.invalidateQueries({
				queryKey: ["transfers", tenantSlug],
			});
			queryClient.invalidateQueries({
				queryKey: ["transfers", tenantSlug, transferId],
			});
			queryClient.invalidateQueries({
				queryKey: ["inventory-items", tenantSlug],
			});
		},
	});
}
