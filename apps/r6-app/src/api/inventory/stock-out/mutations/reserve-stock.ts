import { type ReserveStockInput, ReserveStockSchema } from "@r6/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

export interface ReserveStockParams {
	tenantId: string;
	body: ReserveStockInput;
}

export async function reserveStockFn({
	tenantId,
	body,
}: ReserveStockParams): Promise<unknown> {
	const validated = ReserveStockSchema.parse(body);
	const { data } = await inventoryApi.post<unknown>(
		`/tenants/${tenantId}/stock-out/reserve`,
		validated,
	);
	return data;
}

export function useReserveStockMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: reserveStockFn,
		onSuccess: (_data, { tenantId }) => {
			queryClient.invalidateQueries({
				queryKey: ["inventory-items", tenantId],
			});
			queryClient.invalidateQueries({
				queryKey: ["reservations", tenantId],
			});
		},
	});
}
