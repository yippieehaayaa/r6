import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { identityApi } from "@/api/_app";

// Looser schema for reads — DB rows may contain wildcard permissions
// (e.g. "iam:*:*") that the strict write-time ConcretePermissionSchema rejects.
const IdentityPermissionReadSchema = z.object({
	id: z.string(),
	tenantId: z.string(),
	identityId: z.string(),
	permission: z.string(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

const IdentityPermissionsResponseSchema = z.object({
	data: z.array(IdentityPermissionReadSchema),
});

export type IdentityPermissionRead = z.infer<
	typeof IdentityPermissionReadSchema
>;

export async function getAllIdentityPermissionsFn(
	tenantId: string,
	identityId: string,
): Promise<IdentityPermissionRead[]> {
	const { data } = await identityApi.get<unknown>(
		`/tenants/${tenantId}/identities/${identityId}/permissions`,
	);
	return IdentityPermissionsResponseSchema.parse(data).data;
}

export function useGetAllIdentityPermissionsQuery(
	tenantId: string,
	identityId: string | undefined,
) {
	return useQuery({
		queryKey: ["identity-permissions", tenantId, identityId],
		queryFn: () =>
			// identityId is guaranteed non-null by the `enabled` guard below
			getAllIdentityPermissionsFn(tenantId, identityId as string),
		enabled: !!identityId,
	});
}
