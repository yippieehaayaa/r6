import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { inventoryApi } from "@/api/_app";

const StockCountItemSchema = z.object({
	id: z.string(),
	stockCountId: z.string(),
	variantId: z.string(),
	lotId: z.string().nullable(),
	binLocationId: z.string().nullable(),
	quantityExpected: z.number(),
	quantityActual: z.number().nullable(),
	variance: z.number().nullable(),
	countedBy: z.string().nullable(),
	countedAt: z.string().nullable(),
});

const StockCountDetailSchema = z.object({
	id: z.string(),
	tenantId: z.string(),
	warehouseId: z.string(),
	status: z.string(),
	countType: z.string(),
	notes: z.string().nullable(),
	performedBy: z.string(),
	supervisedBy: z.string().nullable(),
	completedAt: z.string().nullable(),
	createdAt: z.string(),
	updatedAt: z.string(),
	items: z.array(StockCountItemSchema),
});

export type StockCountDetail = z.infer<typeof StockCountDetailSchema>;

export async function getStockCountFn(
	tenantSlug: string,
	id: string,
): Promise<StockCountDetail> {
	const { data } = await inventoryApi.get<unknown>(
		`/tenants/${tenantSlug}/stock-counts/${id}`,
	);
	return StockCountDetailSchema.parse(data);
}

export function useGetStockCountQuery(
	tenantSlug: string,
	id: string,
	options?: { enabled?: boolean },
) {
	return useQuery({
		queryKey: ["stock-counts", tenantSlug, id],
		queryFn: () => getStockCountFn(tenantSlug, id),
		enabled: (options?.enabled ?? true) && !!tenantSlug && !!id,
	});
}
