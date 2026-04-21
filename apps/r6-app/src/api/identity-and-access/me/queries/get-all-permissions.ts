import { type IdentityPermission, IdentityPermissionSchema } from "@r6/schemas";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { identityApi } from "@/api/_app";

export async function getAllPermissionsFn(): Promise<IdentityPermission[]> {
	const { data } = await identityApi.get<unknown>("/me/permissions/all");
	return z.array(IdentityPermissionSchema).parse(data);
}

export function useGetAllPermissionsQuery() {
	return useQuery({
		queryKey: ["me", "permissions", "all"],
		queryFn: getAllPermissionsFn,
	});
}
