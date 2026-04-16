import {
	type AvailabilityResult,
	AvailabilityResultSchema,
	type CheckAvailabilityQuery,
} from "@r6/schemas";
import { useQuery } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

export type { AvailabilityResult };

export async function checkAvailabilityFn(
	tenantSlug: string,
	params: CheckAvailabilityQuery,
): Promise<AvailabilityResult> {
	const { data } = await inventoryApi.get<unknown>(
		`/tenants/${tenantSlug}/availability`,
		{ params },
	);
	return AvailabilityResultSchema.parse(data);
}

export function useCheckAvailabilityQuery(
	tenantSlug: string,
	params: CheckAvailabilityQuery,
	options?: { enabled?: boolean },
) {
	return useQuery({
		queryKey: ["availability", tenantSlug, params],
		queryFn: () => checkAvailabilityFn(tenantSlug, params),
		enabled:
			(options?.enabled ?? true) &&
			!!tenantSlug &&
			!!params.variantId &&
			!!params.warehouseId,
		staleTime: 30 * 1000,
	});
}
