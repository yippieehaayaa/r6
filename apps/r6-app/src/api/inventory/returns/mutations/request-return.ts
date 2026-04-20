import { type RequestReturnInput, RequestReturnSchema } from "@r6/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

export interface RequestReturnParams {
	tenantId: string;
	body: RequestReturnInput;
}

export async function requestReturnFn({
	tenantId,
	body,
}: RequestReturnParams): Promise<unknown> {
	const validated = RequestReturnSchema.parse(body);
	const { data } = await inventoryApi.post<unknown>(
		`/tenants/${tenantId}/returns/request`,
		validated,
	);
	return data;
}

export function useRequestReturnMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: requestReturnFn,
		onSuccess: (_data, { tenantId }) => {
			queryClient.invalidateQueries({ queryKey: ["returns", tenantId] });
		},
	});
}
