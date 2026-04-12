import type { CheckAvailabilityBatchInput } from "@r6/schemas";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { inventoryApi } from "@/api/_app";

const AvailabilityResultSchema = z.object({
	variantId: z.string(),
	warehouseId: z.string(),
	quantityOnHand: z.number(),
	quantityReserved: z.number(),
	quantityAvailable: z.number(),
});

const AvailabilityBatchResultSchema = z.object({
	items: z.array(AvailabilityResultSchema),
});

export type AvailabilityBatchResult = z.infer<
	typeof AvailabilityBatchResultSchema
>;

export interface CheckAvailabilityBatchParams {
	tenantSlug: string;
	body: CheckAvailabilityBatchInput;
}

export async function checkAvailabilityBatchFn({
	tenantSlug,
	body,
}: CheckAvailabilityBatchParams): Promise<AvailabilityBatchResult> {
	const { data } = await inventoryApi.post<unknown>(
		`/tenants/${tenantSlug}/availability/batch`,
		body,
	);
	return AvailabilityBatchResultSchema.parse(data);
}

export function useCheckAvailabilityBatchMutation() {
	return useMutation({
		mutationFn: checkAvailabilityBatchFn,
	});
}
