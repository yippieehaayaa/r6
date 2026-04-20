import { type IdentitySafe, IdentitySafeSchema } from "@r6/schemas";
import { useQuery } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export async function getIdentityFn(
	tenantId: string,
	id: string,
): Promise<IdentitySafe> {
	const { data } = await identityApi.get<unknown>(
		`/tenants/${tenantId}/identities/${id}`,
	);
	return IdentitySafeSchema.parse(data);
}

export function useGetIdentityQuery(tenantId: string, id: string) {
	return useQuery({
		queryKey: ["identity", id],
		queryFn: () => getIdentityFn(tenantId, id),
	});
}
