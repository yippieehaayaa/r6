import {
	type CreatePolicyInput,
	CreatePolicySchema,
	type Policy,
	PolicySchema,
} from "@r6/schemas";
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
	const parsed = CreatePolicySchema.parse(body);
	const { data } = await identityApi.post<unknown>(
		`/tenants/${tenantSlug}/policies`,
		parsed,
	);
	return PolicySchema.parse(data);
}

export function useCreatePolicyMutation() {
	return useMutation({
		mutationFn: createPolicyFn,
	});
}
