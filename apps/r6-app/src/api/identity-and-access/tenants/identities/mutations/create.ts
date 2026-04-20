import {
	type CreateIdentityInput,
	CreateIdentitySchema,
	type IdentitySafe,
	IdentitySafeSchema,
} from "@r6/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export async function createIdentityFn(
	tenantId: string,
	input: CreateIdentityInput,
): Promise<IdentitySafe> {
	const body = CreateIdentitySchema.parse(input);
	const { data } = await identityApi.post<unknown>(
		`/tenants/${tenantId}/identities`,
		body,
	);
	return IdentitySafeSchema.parse(data);
}

export function useCreateIdentityMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			tenantId,
			input,
		}: {
			tenantId: string;
			input: CreateIdentityInput;
		}) => createIdentityFn(tenantId, input),
		onSuccess: (_data, { tenantId }) => {
			queryClient.invalidateQueries({ queryKey: ["identities", tenantId] });
		},
	});
}
