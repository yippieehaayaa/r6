import { type Tenant, TenantSchema, type UpdateTenantInput } from "@r6/schemas";
import { useMutation } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export interface UpdateTenantParams {
	tenantId: string;
	body: UpdateTenantInput;
}

export async function updateTenantFn({
	tenantId,
	body,
}: UpdateTenantParams): Promise<Tenant> {
	const { data } = await identityApi.patch<unknown>(
		`/tenants/${tenantId}`,
		body,
	);
	return TenantSchema.parse(data);
}

export function useUpdateTenantMutation() {
	return useMutation({
		mutationFn: updateTenantFn,
	});
}
