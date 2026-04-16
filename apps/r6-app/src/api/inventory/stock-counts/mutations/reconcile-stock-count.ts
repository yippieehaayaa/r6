import {
	type ReconcileStockCountInput,
	ReconcileStockCountSchema,
} from "@r6/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

export interface ReconcileStockCountParams {
	tenantSlug: string;
	stockCountId: string;
	body: ReconcileStockCountInput;
}

export async function reconcileStockCountFn({
	tenantSlug,
	stockCountId,
	body,
}: ReconcileStockCountParams): Promise<unknown> {
	const validated = ReconcileStockCountSchema.parse(body);
	const { data } = await inventoryApi.post<unknown>(
		`/tenants/${tenantSlug}/stock-counts/${stockCountId}/reconcile`,
		validated,
	);
	return data;
}

export function useReconcileStockCountMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: reconcileStockCountFn,
		onSuccess: (_data, { tenantSlug, stockCountId }) => {
			queryClient.invalidateQueries({
				queryKey: ["stock-counts", tenantSlug],
			});
			queryClient.invalidateQueries({
				queryKey: ["stock-counts", tenantSlug, stockCountId],
			});
			queryClient.invalidateQueries({
				queryKey: ["inventory-items", tenantSlug],
			});
		},
	});
}
