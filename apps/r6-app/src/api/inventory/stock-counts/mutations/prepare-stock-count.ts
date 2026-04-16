import {
	type PrepareStockCountInput,
	PrepareStockCountSchema,
} from "@r6/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

export interface PrepareStockCountParams {
	tenantSlug: string;
	body: PrepareStockCountInput;
}

export async function prepareStockCountFn({
	tenantSlug,
	body,
}: PrepareStockCountParams): Promise<unknown> {
	const validated = PrepareStockCountSchema.parse(body);
	const { data } = await inventoryApi.post<unknown>(
		`/tenants/${tenantSlug}/stock-counts/prepare`,
		validated,
	);
	return data;
}

export function usePrepareStockCountMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: prepareStockCountFn,
		onSuccess: (_data, { tenantSlug }) => {
			queryClient.invalidateQueries({
				queryKey: ["stock-counts", tenantSlug],
			});
		},
	});
}
