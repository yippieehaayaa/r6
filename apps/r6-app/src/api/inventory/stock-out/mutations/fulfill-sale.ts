import { type FulfillSaleInput, FulfillSaleSchema } from "@r6/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

export interface FulfillSaleParams {
	tenantSlug: string;
	body: FulfillSaleInput;
}

export async function fulfillSaleFn({
	tenantSlug,
	body,
}: FulfillSaleParams): Promise<unknown> {
	const validated = FulfillSaleSchema.parse(body);
	const { data } = await inventoryApi.post<unknown>(
		`/tenants/${tenantSlug}/stock-out/fulfill`,
		validated,
	);
	return data;
}

export function useFulfillSaleMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: fulfillSaleFn,
		onSuccess: (_data, { tenantSlug }) => {
			queryClient.invalidateQueries({
				queryKey: ["inventory-items", tenantSlug],
			});
			queryClient.invalidateQueries({
				queryKey: ["reservations", tenantSlug],
			});
			queryClient.invalidateQueries({
				queryKey: ["stock-movements", tenantSlug],
			});
		},
	});
}
