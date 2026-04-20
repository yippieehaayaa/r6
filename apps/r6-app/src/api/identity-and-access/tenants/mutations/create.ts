import {
	type CreateTenantInput,
	type CreateTenantResponse,
	CreateTenantResponseSchema,
	CreateTenantSchema,
} from "@r6/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export async function createTenantFn(
	input: CreateTenantInput,
): Promise<CreateTenantResponse> {
	const body = CreateTenantSchema.parse(input);
	const { data } = await identityApi.post<unknown>("/tenants", body);
	return CreateTenantResponseSchema.parse(data);
}

export function useCreateTenantMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: createTenantFn,
		onSuccess: () => {
			// Creating a tenant sets the caller's tenantId — invalidate the
			// profile so any downstream consumers reflect the updated identity.
			queryClient.invalidateQueries({ queryKey: ["me"] });
		},
	});
}
