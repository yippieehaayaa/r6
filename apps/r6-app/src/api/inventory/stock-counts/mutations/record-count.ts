import { type RecordCountInput, RecordCountSchema } from "@r6/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

export interface RecordCountParams {
	tenantId: string;
	stockCountId: string;
	body: RecordCountInput;
}

export async function recordCountFn({
	tenantId,
	stockCountId,
	body,
}: RecordCountParams): Promise<unknown> {
	const validated = RecordCountSchema.parse(body);
	const { data } = await inventoryApi.post<unknown>(
		`/tenants/${tenantId}/stock-counts/${stockCountId}/record`,
		validated,
	);
	return data;
}

export function useRecordCountMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: recordCountFn,
		onSuccess: (_data, { tenantId, stockCountId }) => {
			queryClient.invalidateQueries({
				queryKey: ["stock-counts", tenantId],
			});
			queryClient.invalidateQueries({
				queryKey: ["stock-counts", tenantId, stockCountId],
			});
		},
	});
}
