import { type ReceiveReturnInput, ReceiveReturnSchema } from "@r6/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

export interface ReceiveReturnParams {
	tenantSlug: string;
	returnRequestId: string;
	body: ReceiveReturnInput;
}

export async function receiveReturnFn({
	tenantSlug,
	returnRequestId,
	body,
}: ReceiveReturnParams): Promise<unknown> {
	const validated = ReceiveReturnSchema.parse(body);
	const { data } = await inventoryApi.post<unknown>(
		`/tenants/${tenantSlug}/returns/${returnRequestId}/receive`,
		validated,
	);
	return data;
}

export function useReceiveReturnMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: receiveReturnFn,
		onSuccess: (_data, { tenantSlug, returnRequestId }) => {
			queryClient.invalidateQueries({ queryKey: ["returns", tenantSlug] });
			queryClient.invalidateQueries({
				queryKey: ["return", tenantSlug, returnRequestId],
			});
		},
	});
}
