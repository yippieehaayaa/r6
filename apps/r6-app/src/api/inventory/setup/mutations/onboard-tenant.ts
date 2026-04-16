import { type OnboardTenantInput, OnboardTenantSchema } from "@r6/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

export interface OnboardTenantParams {
	tenantSlug: string;
	body: OnboardTenantInput;
}

export async function onboardTenantFn({
	tenantSlug,
	body,
}: OnboardTenantParams): Promise<unknown> {
	const validated = OnboardTenantSchema.parse(body);
	const { data } = await inventoryApi.post<unknown>(
		`/tenants/${tenantSlug}/setup/onboard`,
		validated,
	);
	return data;
}

export function useOnboardTenantMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: onboardTenantFn,
		onSuccess: (_data, { tenantSlug }) => {
			queryClient.invalidateQueries({
				queryKey: ["setup-status", tenantSlug],
			});
		},
	});
}
