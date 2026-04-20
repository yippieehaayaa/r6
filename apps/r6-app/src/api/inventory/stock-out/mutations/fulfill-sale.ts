import { type FulfillSaleInput, FulfillSaleSchema } from "@r6/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

export interface FulfillSaleParams {
	tenantId: string;
	body: FulfillSaleInput;
}

export async function fulfillSaleFn({
	tenantId,
	body,
}: FulfillSaleParams): Promise<unknown> {
	const validated = FulfillSaleSchema.parse(body);
	const { data } = await inventoryApi.post<unknown>(
		`/tenants/${tenantId}/stock-out/fulfill`,
		validated,
	);
	return data;
}

export function useFulfillSaleMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: fulfillSaleFn,
		onSuccess: (_data, { tenantId }) => {
			queryClient.invalidateQueries({
				queryKey: ["inventory-items", tenantId],
			});
			queryClient.invalidateQueries({
				queryKey: ["reservations", tenantId],
			});
			queryClient.invalidateQueries({
				queryKey: ["stock-movements", tenantId],
			});
		},
	});
}
