import {
	type ProcessReturnDispositionInput,
	ProcessReturnDispositionSchema,
} from "@r6/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

export interface DispositionReturnParams {
	tenantId: string;
	returnRequestId: string;
	body: ProcessReturnDispositionInput;
}

export async function dispositionReturnFn({
	tenantId,
	returnRequestId,
	body,
}: DispositionReturnParams): Promise<unknown> {
	const validated = ProcessReturnDispositionSchema.parse(body);
	const { data } = await inventoryApi.post<unknown>(
		`/tenants/${tenantId}/returns/${returnRequestId}/disposition`,
		validated,
	);
	return data;
}

export function useDispositionReturnMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: dispositionReturnFn,
		onSuccess: (_data, { tenantId, returnRequestId }) => {
			queryClient.invalidateQueries({ queryKey: ["returns", tenantId] });
			queryClient.invalidateQueries({
				queryKey: ["return", tenantId, returnRequestId],
			});
		},
	});
}
