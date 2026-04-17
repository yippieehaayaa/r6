import { PolicySchema, type Role, RoleSchema } from "@r6/schemas";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { identityApi } from "@/api/_app";

export async function getRoleFn(tenantId: string, id: string): Promise<Role> {
	const { data } = await identityApi.get<unknown>(
		`/tenants/${tenantId}/roles/${id}`,
	);
	return RoleSchema.parse(data);
}

export function useGetRoleQuery(tenantId: string, id: string) {
	return useQuery({
		queryKey: ["roles", tenantId, id],
		queryFn: () => getRoleFn(tenantId, id),
		enabled: !!tenantId && !!id,
	});
}

const RoleWithPoliciesSchema = RoleSchema.extend({
	policies: z.array(PolicySchema),
});

export type RoleWithPolicies = z.infer<typeof RoleWithPoliciesSchema>;

export async function getRoleWithPoliciesFn(
	tenantId: string,
	id: string,
): Promise<RoleWithPolicies> {
	const { data } = await identityApi.get<unknown>(
		`/tenants/${tenantId}/roles/${id}`,
	);
	return RoleWithPoliciesSchema.parse(data);
}

export function useGetRoleWithPoliciesQuery(
	tenantId: string,
	id: string,
	options?: { enabled?: boolean },
) {
	return useQuery({
		queryKey: ["roles", tenantId, id],
		queryFn: () => getRoleWithPoliciesFn(tenantId, id),
		enabled: options?.enabled ?? (!!tenantId && !!id),
	});
}
