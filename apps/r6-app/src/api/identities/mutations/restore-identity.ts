import { type IdentitySafe, IdentitySafeSchema } from "@r6/schemas";
import { useMutation } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export interface RestoreIdentityParams {
	tenantSlug: string;
	id: string;
}

export async function restoreIdentityFn({
	tenantSlug,
	id,
}: RestoreIdentityParams): Promise<IdentitySafe> {
	const { data } = await identityApi.post<unknown>(
		`/tenants/${tenantSlug}/identities/${id}/restore`,
	);
	return IdentitySafeSchema.parse(data);
}

export function useRestoreIdentityMutation() {
	return useMutation({
		mutationFn: restoreIdentityFn,
	});
}
