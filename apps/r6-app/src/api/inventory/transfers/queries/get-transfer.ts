import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { inventoryApi } from "@/api/_app";

const TransferItemSchema = z.object({
	id: z.string(),
	transferId: z.string(),
	variantId: z.string(),
	quantityDispatched: z.number(),
	quantityReceived: z.number().nullable(),
	createdAt: z.string(),
});

const StockTransferDetailSchema = z.object({
	id: z.string(),
	tenantId: z.string(),
	fromWarehouseId: z.string(),
	toWarehouseId: z.string(),
	status: z.string(),
	dispatchedBy: z.string(),
	dispatchedAt: z.string().nullable(),
	expectedAt: z.string().nullable(),
	notes: z.string().nullable(),
	createdAt: z.string(),
	updatedAt: z.string(),
	items: z.array(TransferItemSchema),
});

export type StockTransferDetail = z.infer<typeof StockTransferDetailSchema>;

export async function getTransferFn(
	tenantSlug: string,
	id: string,
): Promise<StockTransferDetail> {
	const { data } = await inventoryApi.get<unknown>(
		`/tenants/${tenantSlug}/transfers/${id}`,
	);
	return StockTransferDetailSchema.parse(data);
}

export function useGetTransferQuery(
	tenantSlug: string,
	id: string,
	options?: { enabled?: boolean },
) {
	return useQuery({
		queryKey: ["transfers", tenantSlug, id],
		queryFn: () => getTransferFn(tenantSlug, id),
		enabled: (options?.enabled ?? true) && !!tenantSlug && !!id,
	});
}
