import { type Policy, PolicySchema } from "@r6/schemas";
import { useQuery } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export async function getPolicyFn(id: string): Promise<Policy> {
	const { data } = await identityApi.get<unknown>(`/policies/${id}`);
	return PolicySchema.parse(data);
}

export function useGetPolicyQuery(id: string) {
	return useQuery({
		queryKey: ["policies", id],
		queryFn: () => getPolicyFn(id),
		enabled: !!id,
	});
}
