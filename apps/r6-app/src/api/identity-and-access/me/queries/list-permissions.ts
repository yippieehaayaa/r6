import {
	type IdentityPermission,
	IdentityPermissionSchema,
	type ListIdentityPermissionsQuery,
	type PaginatedResponse,
	PaginatedResponseSchema,
} from "@r6/schemas";
import { useQuery } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export async function listPermissionsFn(
	params: ListIdentityPermissionsQuery,
): Promise<PaginatedResponse<IdentityPermission>> {
	const { data } = await identityApi.get<unknown>("/me/permissions", {
		params,
	});
	return PaginatedResponseSchema(IdentityPermissionSchema).parse(data);
}

export function useListPermissionsQuery(params: ListIdentityPermissionsQuery) {
	return useQuery({
		queryKey: ["me", "permissions", params],
		queryFn: () => listPermissionsFn(params),
	});
}
