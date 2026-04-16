import {
	type CategoryBrandSetupInput,
	CategoryBrandSetupSchema,
} from "@r6/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

export interface SetupCategoriesBrandsParams {
	tenantSlug: string;
	body: CategoryBrandSetupInput;
}

export async function setupCategoriesBrandsFn({
	tenantSlug,
	body,
}: SetupCategoriesBrandsParams): Promise<unknown> {
	const validated = CategoryBrandSetupSchema.parse(body);
	const { data } = await inventoryApi.post<unknown>(
		`/tenants/${tenantSlug}/setup/categories-brands`,
		validated,
	);
	return data;
}

export function useSetupCategoriesBrandsMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: setupCategoriesBrandsFn,
		onSuccess: (_data, { tenantSlug }) => {
			queryClient.invalidateQueries({
				queryKey: ["setup-status", tenantSlug],
			});
		},
	});
}
