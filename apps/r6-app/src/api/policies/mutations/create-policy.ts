import { type CreatePolicyInput, type Policy, PolicySchema } from "@r6/schemas";
import { useMutation } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export interface CreatePolicyParams {
	tenantSlug: string;
	body: CreatePolicyInput;
}

export async function createPolicyFn({
	tenantSlug,
	body,
}: CreatePolicyParams): Promise<Policy> {
	const { data } = await identityApi.post<unknown>(
		`/tenants/${tenantSlug}/policies`,
		body,
	);
	return PolicySchema.parse(data);
}

export function useCreatePolicyMutation() {
	return useMutation({
		mutationFn: createPolicyFn,
	});
}
