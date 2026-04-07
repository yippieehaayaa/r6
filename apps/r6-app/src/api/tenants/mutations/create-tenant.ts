import {
	type CreateTenantInput,
	type CreateTenantResponse,
	CreateTenantResponseSchema,
} from "@r6/schemas";
import { useMutation } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export async function createTenantFn(
	input: CreateTenantInput,
): Promise<CreateTenantResponse> {
	const { data } = await identityApi.post<unknown>("/tenants", input);
	return CreateTenantResponseSchema.parse(data);
}

export function useCreateTenantMutation() {
	return useMutation({
		mutationFn: createTenantFn,
	});
}
