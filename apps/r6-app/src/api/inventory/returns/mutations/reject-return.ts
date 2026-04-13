import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

export interface RejectReturnParams {
	tenantSlug: string;
	returnRequestId: string;
}

export async function rejectReturnFn({
	tenantSlug,
	returnRequestId,
}: RejectReturnParams): Promise<unknown> {
	const { data } = await inventoryApi.post<unknown>(
		`/tenants/${tenantSlug}/returns/${returnRequestId}/reject`,
		{},
	);
	return data;
}

export function useRejectReturnMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: rejectReturnFn,
		onSuccess: (_data, { tenantSlug, returnRequestId }) => {
			queryClient.invalidateQueries({ queryKey: ["returns", tenantSlug] });
			queryClient.invalidateQueries({
				queryKey: ["return", tenantSlug, returnRequestId],
			});
		},
	});
}
