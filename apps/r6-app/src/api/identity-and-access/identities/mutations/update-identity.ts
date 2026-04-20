import {
	type IdentitySafe,
	IdentitySafeSchema,
	type UpdateIdentityInput,
} from "@r6/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export interface UpdateIdentityParams {
	tenantId: string;
	id: string;
	body: UpdateIdentityInput;
}

export async function updateIdentityFn({
	tenantId,
	id,
	body,
}: UpdateIdentityParams): Promise<IdentitySafe> {
	const { data } = await identityApi.patch<unknown>(
		`/tenants/${tenantId}/identities/${id}`,
		body,
	);
	return IdentitySafeSchema.parse(data);
}

export function useUpdateIdentityMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: updateIdentityFn,
		onSuccess: (_data, { tenantId, id }) => {
			queryClient.invalidateQueries({ queryKey: ["identities", tenantId] });
			queryClient.invalidateQueries({ queryKey: ["identities", tenantId, id] });
		},
	});
}
