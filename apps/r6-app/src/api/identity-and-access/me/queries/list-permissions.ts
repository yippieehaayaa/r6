import {
	type IdentityPermission,
	IdentityPermissionSchema,
	PaginatedResponseSchema,
} from "@r6/schemas";
import { useQuery } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export interface ListPermissionsParams {
	page?: number;
	limit?: number;
}

const ListPermissionsResponseSchema = PaginatedResponseSchema(
	IdentityPermissionSchema,
);

export async function listPermissionsFn(
	params: ListPermissionsParams = {},
): Promise<{
	data: IdentityPermission[];
	page: number;
	limit: number;
	total: number;
}> {
	const { data } = await identityApi.get<unknown>("/me/permissions", {
		params,
	});
	return ListPermissionsResponseSchema.parse(data);
}

export function useListPermissionsQuery(
	params: ListPermissionsParams = {},
	options?: { staleTime?: number; gcTime?: number; enabled?: boolean },
) {
	return useQuery({
		queryKey: ["me", "permissions", params],
		queryFn: () => listPermissionsFn(params),
		...options,
	});
}
