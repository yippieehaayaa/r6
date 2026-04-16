import { type ProductSetupInput, ProductSetupSchema } from "@r6/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

export interface SetupProductParams {
	tenantSlug: string;
	body: ProductSetupInput;
}

export async function setupProductFn({
	tenantSlug,
	body,
}: SetupProductParams): Promise<unknown> {
	const validated = ProductSetupSchema.parse(body);
	const { data } = await inventoryApi.post<unknown>(
		`/tenants/${tenantSlug}/setup/products`,
		validated,
	);
	return data;
}

export function useSetupProductMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: setupProductFn,
		onSuccess: (_data, { tenantSlug }) => {
			queryClient.invalidateQueries({
				queryKey: ["setup-status", tenantSlug],
			});
		},
	});
}
