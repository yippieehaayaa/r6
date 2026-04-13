import { type ReceiveTransferInput, ReceiveTransferSchema } from "@r6/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

export interface ReceiveTransferParams {
	tenantSlug: string;
	transferId: string;
	body: ReceiveTransferInput;
}

export async function receiveTransferFn({
	tenantSlug,
	transferId,
	body,
}: ReceiveTransferParams): Promise<unknown> {
	const validated = ReceiveTransferSchema.parse(body);
	const { data } = await inventoryApi.post<unknown>(
		`/tenants/${tenantSlug}/transfers/${transferId}/receive`,
		validated,
	);
	return data;
}

export function useReceiveTransferMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: receiveTransferFn,
		onSuccess: (_data, { tenantSlug, transferId }) => {
			queryClient.invalidateQueries({
				queryKey: ["transfers", tenantSlug],
			});
			queryClient.invalidateQueries({
				queryKey: ["transfers", tenantSlug, transferId],
			});
			queryClient.invalidateQueries({
				queryKey: ["inventory-items", tenantSlug],
			});
		},
	});
}
