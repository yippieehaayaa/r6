import {
	type CreateIdentityInput,
	CreateIdentitySchema,
	type IdentitySafe,
	IdentitySafeSchema,
} from "@r6/schemas";
import { useMutation } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export interface CreateIdentityParams {
	tenantSlug: string;
	body: CreateIdentityInput;
}

export async function createIdentityFn({
	tenantSlug,
	body,
}: CreateIdentityParams): Promise<IdentitySafe> {
	const parsed = CreateIdentitySchema.parse(body);
	const { data } = await identityApi.post<unknown>(
		`/tenants/${tenantSlug}/identities`,
		parsed,
	);
	return IdentitySafeSchema.parse(data);
}

export function useCreateIdentityMutation() {
	return useMutation({
		mutationFn: createIdentityFn,
	});
}
