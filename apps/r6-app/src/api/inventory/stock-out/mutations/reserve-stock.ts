import { type ReserveStockInput, ReserveStockSchema } from "@r6/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

export interface ReserveStockParams {
	tenantSlug: string;
	body: ReserveStockInput;
}

export async function reserveStockFn({
	tenantSlug,
	body,
}: ReserveStockParams): Promise<unknown> {
	const validated = ReserveStockSchema.parse(body);
	const { data } = await inventoryApi.post<unknown>(
		`/tenants/${tenantSlug}/stock-out/reserve`,
		validated,
	);
	return data;
}

export function useReserveStockMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: reserveStockFn,
		onSuccess: (_data, { tenantSlug }) => {
			queryClient.invalidateQueries({
				queryKey: ["inventory-items", tenantSlug],
			});
			queryClient.invalidateQueries({
				queryKey: ["reservations", tenantSlug],
			});
		},
	});
}
