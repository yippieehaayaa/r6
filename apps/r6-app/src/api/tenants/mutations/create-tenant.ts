import {
	type CreateTenantInput,
	CreateTenantSchema,
	type Tenant,
	TenantSchema,
} from "@r6/schemas";
import { useMutation } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export async function createTenantFn(
	input: CreateTenantInput,
): Promise<Tenant> {
	const body = CreateTenantSchema.parse(input);
	const { data } = await identityApi.post<unknown>("/tenants", body);
	return TenantSchema.parse(data);
}

export function useCreateTenantMutation() {
	return useMutation({
		mutationFn: createTenantFn,
	});
}
