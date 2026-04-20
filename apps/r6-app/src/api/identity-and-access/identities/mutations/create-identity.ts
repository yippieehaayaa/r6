import {
	type CreateIdentityInput,
	type IdentitySafe,
	IdentitySafeSchema,
} from "@r6/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export interface CreateIdentityParams {
	tenantId: string;
	body: CreateIdentityInput;
}

export async function createIdentityFn({
	tenantId,
	body,
}: CreateIdentityParams): Promise<IdentitySafe> {
	const { data } = await identityApi.post<unknown>(
		`/tenants/${tenantId}/identities`,
		body,
	);
	return IdentitySafeSchema.parse(data);
}

export function useCreateIdentityMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: createIdentityFn,
		onSuccess: (_data, { tenantId }) => {
			queryClient.invalidateQueries({ queryKey: ["identities", tenantId] });
		},
	});
}
