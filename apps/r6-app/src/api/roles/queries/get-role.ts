import { PolicySchema, type Role, RoleSchema } from "@r6/schemas";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { identityApi } from "@/api/_app";

export async function getRoleFn(tenantSlug: string, id: string): Promise<Role> {
	const { data } = await identityApi.get<unknown>(
		`/tenants/${tenantSlug}/roles/${id}`,
	);
	return RoleSchema.parse(data);
}

export function useGetRoleQuery(tenantSlug: string, id: string) {
	return useQuery({
		queryKey: ["roles", tenantSlug, id],
		queryFn: () => getRoleFn(tenantSlug, id),
		enabled: !!tenantSlug && !!id,
	});
}

const RoleWithPoliciesSchema = RoleSchema.extend({
	policies: z.array(PolicySchema),
});

export type RoleWithPolicies = z.infer<typeof RoleWithPoliciesSchema>;

export async function getRoleWithPoliciesFn(
	tenantSlug: string,
	id: string,
): Promise<RoleWithPolicies> {
	const { data } = await identityApi.get<unknown>(
		`/tenants/${tenantSlug}/roles/${id}`,
	);
	return RoleWithPoliciesSchema.parse(data);
}

export function useGetRoleWithPoliciesQuery(
	tenantSlug: string,
	id: string,
	options?: { enabled?: boolean },
) {
	return useQuery({
		queryKey: ["roles", tenantSlug, id],
		queryFn: () => getRoleWithPoliciesFn(tenantSlug, id),
		enabled: options?.enabled ?? (!!tenantSlug && !!id),
	});
}
