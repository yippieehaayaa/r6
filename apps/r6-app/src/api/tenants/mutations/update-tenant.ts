import {
	type Tenant,
	TenantSchema,
	type UpdateTenantInput,
	UpdateTenantSchema,
} from "@r6/schemas";
import { useMutation } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export interface UpdateTenantParams {
	tenantSlug: string;
	body: UpdateTenantInput;
}

export async function updateTenantFn({
	tenantSlug,
	body,
}: UpdateTenantParams): Promise<Tenant> {
	const parsed = UpdateTenantSchema.parse(body);
	const { data } = await identityApi.patch<unknown>(
		`/tenants/${tenantSlug}`,
		parsed,
	);
	return TenantSchema.parse(data);
}

export function useUpdateTenantMutation() {
	return useMutation({
		mutationFn: updateTenantFn,
	});
}
