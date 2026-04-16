import { type WarehouseSetupInput, WarehouseSetupSchema } from "@r6/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

export interface SetupWarehouseParams {
	tenantSlug: string;
	body: WarehouseSetupInput;
}

export async function setupWarehouseFn({
	tenantSlug,
	body,
}: SetupWarehouseParams): Promise<unknown> {
	const validated = WarehouseSetupSchema.parse(body);
	const { data } = await inventoryApi.post<unknown>(
		`/tenants/${tenantSlug}/setup/warehouses`,
		validated,
	);
	return data;
}

export function useSetupWarehouseMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: setupWarehouseFn,
		onSuccess: (_data, { tenantSlug }) => {
			queryClient.invalidateQueries({
				queryKey: ["setup-status", tenantSlug],
			});
		},
	});
}
