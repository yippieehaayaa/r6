import { PolicySchema, RoleSchema } from "@r6/schemas";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { identityApi } from "@/api/_app";

const RoleWithPoliciesSchema = RoleSchema.extend({
	policies: z.array(PolicySchema),
});

export type RoleWithPolicies = z.infer<typeof RoleWithPoliciesSchema>;

export async function getRoleWithPoliciesFn(
	tenantId: string,
	id: string,
): Promise<RoleWithPolicies> {
	const { data } = await identityApi.get<unknown>(
		`/tenants/${tenantId}/roles/${id}/policies`,
	);
	return RoleWithPoliciesSchema.parse(data);
}

export function useGetRoleWithPoliciesQuery(
	tenantId: string,
	id: string,
	options?: { enabled?: boolean },
) {
	return useQuery({
		queryKey: ["roles", tenantId, id, "policies"],
		queryFn: () => getRoleWithPoliciesFn(tenantId, id),
		enabled: (options?.enabled ?? true) && !!tenantId && !!id,
	});
}
