import {
	type AvailabilityBatchResult,
	AvailabilityBatchResultSchema,
	type CheckAvailabilityBatchInput,
} from "@r6/schemas";
import { useMutation } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

export type { AvailabilityBatchResult };

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
