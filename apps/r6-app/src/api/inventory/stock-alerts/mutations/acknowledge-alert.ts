import { type AlertActionInput, AlertActionSchema } from "@r6/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

export interface AcknowledgeAlertParams {
	tenantSlug: string;
	alertId: string;
	body?: AlertActionInput;
}

export async function acknowledgeAlertFn({
	tenantSlug,
	alertId,
	body = {},
}: AcknowledgeAlertParams): Promise<unknown> {
	const validated = AlertActionSchema.parse(body);
	const { data } = await inventoryApi.post<unknown>(
		`/tenants/${tenantSlug}/stock-alerts/${alertId}/acknowledge`,
		validated,
	);
	return data;
}

export function useAcknowledgeAlertMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: acknowledgeAlertFn,
		onSuccess: (_data, { tenantSlug, alertId }) => {
			queryClient.invalidateQueries({
				queryKey: ["stock-alerts", tenantSlug],
			});
			queryClient.invalidateQueries({
				queryKey: ["stock-alerts", tenantSlug, alertId],
			});
		},
	});
}
