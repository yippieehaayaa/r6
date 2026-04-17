import {
	type ManualAdjustmentInput,
	type ManualAdjustmentResult,
	ManualAdjustmentResultSchema,
} from "@r6/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

export type { ManualAdjustmentResult };

export interface ManualAdjustmentParams {
	tenantId: string;
	body: ManualAdjustmentInput;
}

export async function manualAdjustmentFn({
	tenantId,
	body,
}: ManualAdjustmentParams): Promise<ManualAdjustmentResult> {
	const { data } = await inventoryApi.post<unknown>(
		`/tenants/${tenantId}/corrections/adjust`,
		body,
	);
	return ManualAdjustmentResultSchema.parse(data);
}

export function useManualAdjustmentMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: manualAdjustmentFn,
		onSuccess: (_data, { tenantId }) => {
			queryClient.invalidateQueries({
				queryKey: ["inventory-items", tenantId],
			});
			queryClient.invalidateQueries({
				queryKey: ["availability", tenantId],
			});
		},
	});
}
