import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

export interface ProcessExpiryParams {
	tenantSlug: string;
}

export async function processExpiryFn({
	tenantSlug,
}: ProcessExpiryParams): Promise<unknown> {
	const { data } = await inventoryApi.post<unknown>(
		`/tenants/${tenantSlug}/stock-alerts/process-expiry`,
	);
	return data;
}

export function useProcessExpiryMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: processExpiryFn,
		onSuccess: (_data, { tenantSlug }) => {
			queryClient.invalidateQueries({
				queryKey: ["stock-alerts", tenantSlug],
			});
		},
	});
}
