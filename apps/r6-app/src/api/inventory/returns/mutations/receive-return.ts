import { type ReceiveReturnInput, ReceiveReturnSchema } from "@r6/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

export interface ReceiveReturnParams {
	tenantId: string;
	returnRequestId: string;
	body: ReceiveReturnInput;
}

export async function receiveReturnFn({
	tenantId,
	returnRequestId,
	body,
}: ReceiveReturnParams): Promise<unknown> {
	const validated = ReceiveReturnSchema.parse(body);
	const { data } = await inventoryApi.post<unknown>(
		`/tenants/${tenantId}/returns/${returnRequestId}/receive`,
		validated,
	);
	return data;
}

export function useReceiveReturnMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: receiveReturnFn,
		onSuccess: (_data, { tenantId, returnRequestId }) => {
			queryClient.invalidateQueries({ queryKey: ["returns", tenantId] });
			queryClient.invalidateQueries({
				queryKey: ["return", tenantId, returnRequestId],
			});
		},
	});
}
