import type { CheckAvailabilityQuery } from "@r6/schemas";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { inventoryApi } from "@/api/_app";

const AvailabilityResultSchema = z.object({
	variantId: z.string(),
	warehouseId: z.string(),
	quantityOnHand: z.number(),
	quantityReserved: z.number(),
	quantityAvailable: z.number(),
});

export type AvailabilityResult = z.infer<typeof AvailabilityResultSchema>;

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
