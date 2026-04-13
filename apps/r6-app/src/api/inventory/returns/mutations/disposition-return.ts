import {
	type ProcessReturnDispositionInput,
	ProcessReturnDispositionSchema,
} from "@r6/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

export interface DispositionReturnParams {
	tenantSlug: string;
	returnRequestId: string;
	body: ProcessReturnDispositionInput;
}

export async function dispositionReturnFn({
	tenantSlug,
	returnRequestId,
	body,
}: DispositionReturnParams): Promise<unknown> {
	const validated = ProcessReturnDispositionSchema.parse(body);
	const { data } = await inventoryApi.post<unknown>(
		`/tenants/${tenantSlug}/returns/${returnRequestId}/disposition`,
		validated,
	);
	return data;
}

export function useDispositionReturnMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: dispositionReturnFn,
		onSuccess: (_data, { tenantSlug, returnRequestId }) => {
			queryClient.invalidateQueries({ queryKey: ["returns", tenantSlug] });
			queryClient.invalidateQueries({
				queryKey: ["return", tenantSlug, returnRequestId],
			});
		},
	});
}
