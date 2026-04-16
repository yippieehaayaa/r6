import {
	type DispatchTransferInput,
	DispatchTransferSchema,
} from "@r6/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

export interface DispatchTransferParams {
	tenantSlug: string;
	body: DispatchTransferInput;
}

export async function dispatchTransferFn({
	tenantSlug,
	body,
}: DispatchTransferParams): Promise<unknown> {
	const validated = DispatchTransferSchema.parse(body);
	const { data } = await inventoryApi.post<unknown>(
		`/tenants/${tenantSlug}/transfers/dispatch`,
		validated,
	);
	return data;
}

export function useDispatchTransferMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: dispatchTransferFn,
		onSuccess: (_data, { tenantSlug }) => {
			queryClient.invalidateQueries({
				queryKey: ["transfers", tenantSlug],
			});
			queryClient.invalidateQueries({
				queryKey: ["inventory-items", tenantSlug],
			});
		},
	});
}
