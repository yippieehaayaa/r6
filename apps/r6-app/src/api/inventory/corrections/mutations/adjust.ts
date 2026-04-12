import type { ManualAdjustmentInput } from "@r6/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { inventoryApi } from "@/api/_app";

const InventoryItemSnapshotSchema = z.object({
	id: z.string(),
	variantId: z.string(),
	warehouseId: z.string(),
	quantityOnHand: z.number(),
	quantityReserved: z.number(),
	updatedAt: z.string(),
});

const ManualAdjustmentResultSchema = z.object({
	inventoryItem: InventoryItemSnapshotSchema,
	lotAdjustments: z.array(z.unknown()),
	auditLog: z.object({ id: z.string() }),
	alerts: z.array(z.unknown()),
});

export type ManualAdjustmentResult = z.infer<
	typeof ManualAdjustmentResultSchema
>;

export interface ManualAdjustmentParams {
	tenantSlug: string;
	body: ManualAdjustmentInput;
}

export async function manualAdjustmentFn({
	tenantSlug,
	body,
}: ManualAdjustmentParams): Promise<ManualAdjustmentResult> {
	const { data } = await inventoryApi.post<unknown>(
		`/tenants/${tenantSlug}/corrections/adjust`,
		body,
	);
	return ManualAdjustmentResultSchema.parse(data);
}

export function useManualAdjustmentMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: manualAdjustmentFn,
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
