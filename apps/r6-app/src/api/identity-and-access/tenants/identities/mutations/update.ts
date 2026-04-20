import {
	type IdentitySafe,
	IdentitySafeSchema,
	type UpdateIdentityInput,
	UpdateIdentitySchema,
} from "@r6/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export async function updateIdentityFn(
	tenantId: string,
	id: string,
	input: UpdateIdentityInput,
): Promise<IdentitySafe> {
	const body = UpdateIdentitySchema.parse(input);
	const { data } = await identityApi.patch<unknown>(
		`/tenants/${tenantId}/identities/${id}`,
		body,
	);
	return IdentitySafeSchema.parse(data);
}

export function useUpdateIdentityMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			tenantId,
			id,
			input,
		}: {
			tenantId: string;
			id: string;
			input: UpdateIdentityInput;
		}) => updateIdentityFn(tenantId, id, input),
		onSuccess: (_data, { tenantId, id }) => {
			queryClient.invalidateQueries({ queryKey: ["identity", id] });
			queryClient.invalidateQueries({ queryKey: ["identities", tenantId] });
		},
	});
}
