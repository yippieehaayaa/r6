import { type CatalogSetupInput, CatalogSetupSchema } from "@r6/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

export interface SetupCatalogParams {
	tenantSlug: string;
	body: CatalogSetupInput;
}

export async function setupCatalogFn({
	tenantSlug,
	body,
}: SetupCatalogParams): Promise<unknown> {
	const validated = CatalogSetupSchema.parse(body);
	const { data } = await inventoryApi.post<unknown>(
		`/tenants/${tenantSlug}/setup/catalog`,
		validated,
	);
	return data;
}

export function useSetupCatalogMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: setupCatalogFn,
		onSuccess: (_data, { tenantSlug }) => {
			queryClient.invalidateQueries({
				queryKey: ["setup-status", tenantSlug],
			});
		},
	});
}
