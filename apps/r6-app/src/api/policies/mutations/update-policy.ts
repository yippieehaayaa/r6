import {
	type Policy,
	PolicySchema,
	type UpdatePolicyInput,
	UpdatePolicySchema,
} from "@r6/schemas";
import { useMutation } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export interface UpdatePolicyParams {
	tenantSlug: string;
	id: string;
	body: UpdatePolicyInput;
}

export async function updatePolicyFn({
	tenantSlug,
	id,
	body,
}: UpdatePolicyParams): Promise<Policy> {
	const parsed = UpdatePolicySchema.parse(body);
	const { data } = await identityApi.patch<unknown>(
		`/tenants/${tenantSlug}/policies/${id}`,
		parsed,
	);
	return PolicySchema.parse(data);
}

export function useUpdatePolicyMutation() {
	return useMutation({
		mutationFn: updatePolicyFn,
	});
}
