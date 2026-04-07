import {
	type IdentitySafe,
	IdentitySafeSchema,
	type ProvisionIdentityInput,
} from "@r6/schemas";
import { useMutation } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export interface ProvisionIdentityParams {
	tenantSlug: string;
	body: ProvisionIdentityInput;
}

export async function provisionIdentityFn({
	tenantSlug,
	body,
}: ProvisionIdentityParams): Promise<IdentitySafe> {
	const { data } = await identityApi.post<unknown>(
		`/tenants/${tenantSlug}/provision`,
		body,
	);
	return IdentitySafeSchema.parse(data);
}

export function useProvisionIdentityMutation() {
	return useMutation({ mutationFn: provisionIdentityFn });
}
