import { type RequestReturnInput, RequestReturnSchema } from "@r6/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

export interface RequestReturnParams {
	tenantSlug: string;
	body: RequestReturnInput;
}

export async function requestReturnFn({
	tenantSlug,
	body,
}: RequestReturnParams): Promise<unknown> {
	const validated = RequestReturnSchema.parse(body);
	const { data } = await inventoryApi.post<unknown>(
		`/tenants/${tenantSlug}/returns/request`,
		validated,
	);
	return data;
}

export function useRequestReturnMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: requestReturnFn,
		onSuccess: (_data, { tenantSlug }) => {
			queryClient.invalidateQueries({ queryKey: ["returns", tenantSlug] });
		},
	});
}
