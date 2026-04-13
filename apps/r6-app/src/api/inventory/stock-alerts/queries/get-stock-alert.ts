import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { inventoryApi } from "@/api/_app";

const StockAlertDetailSchema = z.object({
	id: z.string(),
	tenantId: z.string(),
	alertType: z.string(),
	status: z.string(),
	variantId: z.string().nullable(),
	warehouseId: z.string().nullable(),
	threshold: z.number().nullable(),
	currentValue: z.number().nullable(),
	notes: z.string().nullable(),
	acknowledgedBy: z.string().nullable(),
	acknowledgedAt: z.string().nullable(),
	resolvedBy: z.string().nullable(),
	resolvedAt: z.string().nullable(),
	createdAt: z.string(),
	updatedAt: z.string(),
});

export type StockAlertDetail = z.infer<typeof StockAlertDetailSchema>;

export async function getStockAlertFn(
	tenantSlug: string,
	id: string,
): Promise<StockAlertDetail> {
	const { data } = await inventoryApi.get<unknown>(
		`/tenants/${tenantSlug}/stock-alerts/${id}`,
	);
	return StockAlertDetailSchema.parse(data);
}

export function useGetStockAlertQuery(
	tenantSlug: string,
	id: string,
	options?: { enabled?: boolean },
) {
	return useQuery({
		queryKey: ["stock-alerts", tenantSlug, id],
		queryFn: () => getStockAlertFn(tenantSlug, id),
		enabled: (options?.enabled ?? true) && !!tenantSlug && !!id,
	});
}
