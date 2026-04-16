import { type ReceiveStockInput, ReceiveStockSchema } from "@r6/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

export interface ReceiveStockParams {
	tenantSlug: string;
	body: ReceiveStockInput;
}

export async function receiveStockFn({
	tenantSlug,
	body,
}: ReceiveStockParams): Promise<unknown> {
	const validated = ReceiveStockSchema.parse(body);
	const { data } = await inventoryApi.post<unknown>(
		`/tenants/${tenantSlug}/stock-in/receive`,
		validated,
	);
	return data;
}

export function useReceiveStockMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: receiveStockFn,
		onSuccess: (_data, { tenantSlug }) => {
			queryClient.invalidateQueries({
				queryKey: ["inventory-items", tenantSlug],
			});
			queryClient.invalidateQueries({
				queryKey: ["stock-movements", tenantSlug],
			});
			queryClient.invalidateQueries({
				queryKey: ["lots", tenantSlug],
			});
		},
	});
}
