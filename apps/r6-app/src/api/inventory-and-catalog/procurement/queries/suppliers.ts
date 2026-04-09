import {
	PaginatedResponseSchema,
	type Supplier,
	SupplierSchema,
} from "@r6/schemas";
import { useQuery } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

export interface ListSuppliersParams {
	page?: number;
	limit?: number;
	search?: string;
	isActive?: boolean;
}

const ListSuppliersResponseSchema = PaginatedResponseSchema(SupplierSchema);

export async function listSuppliersFn(
	params: ListSuppliersParams = {},
): Promise<{ data: Supplier[]; page: number; limit: number; total: number }> {
	const { data } = await inventoryApi.get<unknown>("/procurement/suppliers", {
		params,
	});
	return ListSuppliersResponseSchema.parse(data);
}

export async function getSupplierFn(id: string): Promise<Supplier> {
	const { data } = await inventoryApi.get<unknown>(
		`/procurement/suppliers/${id}`,
	);
	return SupplierSchema.parse(data);
}

export function useListSuppliersQuery(
	params: ListSuppliersParams = {},
	options?: { staleTime?: number; gcTime?: number; enabled?: boolean },
) {
	return useQuery({
		queryKey: ["suppliers", params],
		queryFn: () => listSuppliersFn(params),
		...options,
	});
}

export function useGetSupplierQuery(id: string) {
	return useQuery({
		queryKey: ["suppliers", id],
		queryFn: () => getSupplierFn(id),
		enabled: !!id,
	});
}
