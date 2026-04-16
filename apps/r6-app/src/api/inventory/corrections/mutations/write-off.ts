import {
	type WriteOffResult,
	WriteOffResultSchema,
	type WriteOffStockInput,
} from "@r6/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

export type { WriteOffResult };

export interface WriteOffStockParams {
	tenantSlug: string;
	body: WriteOffStockInput;
}

export async function writeOffStockFn({
	tenantSlug,
	body,
}: WriteOffStockParams): Promise<WriteOffResult> {
	const { data } = await inventoryApi.post<unknown>(
		`/tenants/${tenantSlug}/corrections/write-off`,
		body,
	);
	return WriteOffResultSchema.parse(data);
}

export function useWriteOffStockMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: writeOffStockFn,
		onSuccess: (_data, { tenantSlug }) => {
			queryClient.invalidateQueries({
				queryKey: ["inventory-items", tenantSlug],
			});
			queryClient.invalidateQueries({
				queryKey: ["availability", tenantSlug],
			});
		},
	});
}
