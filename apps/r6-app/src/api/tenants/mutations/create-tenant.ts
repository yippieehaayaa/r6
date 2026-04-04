import { type CreateTenantInput, type Tenant, TenantSchema } from "@r6/schemas";
import { useMutation } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export async function createTenantFn(
	input: CreateTenantInput,
): Promise<Tenant> {
	const { data } = await identityApi.post<unknown>("/tenants", input);
	return TenantSchema.parse(data);
}

export function useCreateTenantMutation() {
	return useMutation({
		mutationFn: createTenantFn,
	});
}
