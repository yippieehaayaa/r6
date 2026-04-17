import {
	type ReconcileStockCountInput,
	ReconcileStockCountSchema,
} from "@r6/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

export interface ReconcileStockCountParams {
	tenantId: string;
	stockCountId: string;
	body: ReconcileStockCountInput;
}

export async function reconcileStockCountFn({
	tenantId,
	stockCountId,
	body,
}: ReconcileStockCountParams): Promise<unknown> {
	const validated = ReconcileStockCountSchema.parse(body);
	const { data } = await inventoryApi.post<unknown>(
		`/tenants/${tenantId}/stock-counts/${stockCountId}/reconcile`,
		validated,
	);
	return data;
}

export function useReconcileStockCountMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: reconcileStockCountFn,
		onSuccess: (_data, { tenantId, stockCountId }) => {
			queryClient.invalidateQueries({
				queryKey: ["stock-counts", tenantId],
			});
			queryClient.invalidateQueries({
				queryKey: ["stock-counts", tenantId, stockCountId],
			});
			queryClient.invalidateQueries({
				queryKey: ["inventory-items", tenantId],
			});
		},
	});
}
