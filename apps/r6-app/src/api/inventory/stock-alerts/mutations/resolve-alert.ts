import { type AlertActionInput, AlertActionSchema } from "@r6/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

export interface ResolveAlertParams {
	tenantSlug: string;
	alertId: string;
	body?: AlertActionInput;
}

export async function resolveAlertFn({
	tenantSlug,
	alertId,
	body = {},
}: ResolveAlertParams): Promise<unknown> {
	const validated = AlertActionSchema.parse(body);
	const { data } = await inventoryApi.post<unknown>(
		`/tenants/${tenantSlug}/stock-alerts/${alertId}/resolve`,
		validated,
	);
	return data;
}

export function useResolveAlertMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: resolveAlertFn,
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
