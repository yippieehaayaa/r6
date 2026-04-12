import type { WriteOffStockInput } from "@r6/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { inventoryApi } from "@/api/_app";

const WriteOffResultSchema = z.object({
	inventoryItem: z.object({
		id: z.string(),
		variantId: z.string(),
		warehouseId: z.string(),
		quantityOnHand: z.number(),
		quantityReserved: z.number(),
		updatedAt: z.string(),
	}),
	lot: z.object({
		id: z.string(),
		lotNumber: z.string().nullable(),
		quantityRemaining: z.number(),
	}),
	movement: z.object({ id: z.string() }),
	auditLog: z.object({ id: z.string() }),
	alerts: z.array(z.unknown()),
});

export type WriteOffResult = z.infer<typeof WriteOffResultSchema>;

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
