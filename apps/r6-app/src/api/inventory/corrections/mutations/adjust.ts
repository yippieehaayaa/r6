import {
	type ManualAdjustmentInput,
	type ManualAdjustmentResult,
	ManualAdjustmentResultSchema,
} from "@r6/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

export type { ManualAdjustmentResult };

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
