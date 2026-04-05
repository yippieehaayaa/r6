import { type IdentitySafe, IdentitySafeSchema } from "@r6/schemas";
import { useQuery } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export async function getIdentityFn(
	tenantSlug: string,
	id: string,
): Promise<IdentitySafe> {
	const { data } = await identityApi.get<unknown>(
		`/tenants/${tenantSlug}/identities/${id}`,
	);
	return IdentitySafeSchema.parse(data);
}

export function useGetIdentityQuery(tenantSlug: string, id: string) {
	return useQuery({
		queryKey: ["identities", tenantSlug, id],
		queryFn: () => getIdentityFn(tenantSlug, id),
		enabled: !!tenantSlug && !!id,
	});
}
