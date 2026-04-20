import {
	type PrepareStockCountInput,
	PrepareStockCountSchema,
} from "@r6/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

export interface PrepareStockCountParams {
	tenantId: string;
	body: PrepareStockCountInput;
}

export async function prepareStockCountFn({
	tenantId,
	body,
}: PrepareStockCountParams): Promise<unknown> {
	const validated = PrepareStockCountSchema.parse(body);
	const { data } = await inventoryApi.post<unknown>(
		`/tenants/${tenantId}/stock-counts/prepare`,
		validated,
	);
	return data;
}

export function usePrepareStockCountMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: prepareStockCountFn,
		onSuccess: (_data, { tenantId }) => {
			queryClient.invalidateQueries({
				queryKey: ["stock-counts", tenantId],
			});
		},
	});
}
