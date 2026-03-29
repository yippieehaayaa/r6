import {
	type IdentitySafe,
	IdentitySafeSchema,
	type UpdateIdentityInput,
	UpdateIdentitySchema,
} from "@r6/schemas";
import { useMutation } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export interface UpdateIdentityParams {
	tenantSlug: string;
	id: string;
	body: UpdateIdentityInput;
}

export async function updateIdentityFn({
	tenantSlug,
	id,
	body,
}: UpdateIdentityParams): Promise<IdentitySafe> {
	const parsed = UpdateIdentitySchema.parse(body);
	const { data } = await identityApi.patch<unknown>(
		`/tenants/${tenantSlug}/identities/${id}`,
		parsed,
	);
	return IdentitySafeSchema.parse(data);
}

export function useUpdateIdentityMutation() {
	return useMutation({
		mutationFn: updateIdentityFn,
	});
}
