import type { ProductVariant } from "@r6/schemas";
import type { ColumnDef, PaginationState } from "@tanstack/react-table";
import { Layers, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useListVariantsByProductQuery } from "@/api/inventory-and-catalog";
import { useAuth } from "@/auth";
import { DataTable } from "@/components/table/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface VariantRow {
	id: string;
	name: string;
	sku: string;
	attributes: string;
	productName: string;
	status: string;
}

function mapVariant(v: ProductVariant, productId: string): VariantRow {
	return {
		id: v.id,
		name: v.name,
		sku: v.sku,
		attributes: JSON.stringify(v.options),
		productName: productId,
		status: v.isActive ? "Active" : "Inactive",
	};
}

const columns: ColumnDef<VariantRow>[] = [
	{
		accessorKey: "name",
		header: "Name",
		cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
	},
	{
		accessorKey: "sku",
		header: "SKU",
		cell: ({ row }) => (
			<span className="font-mono text-xs text-muted-foreground">
				{row.original.sku}
			</span>
		),
	},
	{
		accessorKey: "attributes",
		header: "Options",
		cell: ({ row }) => (
			<span className="text-xs text-muted-foreground font-mono">
				{row.original.attributes}
			</span>
		),
	},
	{
		accessorKey: "productName",
		header: "Product ID",
		cell: ({ row }) => (
			<span className="text-xs text-muted-foreground font-mono">
				{row.original.productName}
			</span>
		),
	},
	{
		accessorKey: "status",
		header: "Status",
		cell: ({ row }) => (
			<Badge
				variant={row.original.status === "Active" ? "default" : "secondary"}
			>
				{row.original.status}
			</Badge>
		),
	},
];

export default function VariantsPage() {
	const { hasPermission } = useAuth();
	const canCreate = hasPermission("catalog:variant:create");

	const [productIdInput, setProductIdInput] = useState("");
	const [productId, setProductId] = useState("");
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 20,
	});

	const { data, isLoading } = useListVariantsByProductQuery(productId, {
		page: pagination.pageIndex + 1,
		limit: pagination.pageSize,
	});

	const rows = useMemo(
		() => (data?.data ?? []).map((v) => mapVariant(v, productId)),
		[data, productId],
	);

	function handleSearch(e: React.FormEvent) {
		e.preventDefault();
		setPagination((p) => ({ ...p, pageIndex: 0 }));
		setProductId(productIdInput.trim());
	}

	return (
		<div className="flex flex-1 flex-col gap-4 p-4 pt-0 animate-stagger-children">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-xl font-semibold">Variants</h1>
					<p className="text-sm text-muted-foreground">
						Manage product variants such as size, color, and SKU.
					</p>
				</div>
				{canCreate && productId && (
					<Button onClick={() => {}}>
						<Plus className="size-4" />
						Add Variant
					</Button>
				)}
			</div>

			{/* Product ID search */}
			<div className="rounded-xl border bg-card p-4">
				<form
					onSubmit={handleSearch}
					className="flex flex-col gap-2 sm:flex-row sm:items-end"
				>
					<div className="flex-1 flex flex-col gap-1.5">
						<Label htmlFor="productId">Product ID</Label>
						<Input
							id="productId"
							placeholder="Enter a product ID to view its variants..."
							value={productIdInput}
							onChange={(e) => setProductIdInput(e.target.value)}
						/>
					</div>
					<Button type="submit">Load Variants</Button>
				</form>
			</div>

			{!productId ? (
				<div className="rounded-xl border bg-card flex flex-col items-center justify-center gap-3 p-12 text-center">
					<Layers className="size-10 text-muted-foreground/40" />
					<p className="text-sm font-medium">No product selected</p>
					<p className="text-xs text-muted-foreground">
						Enter a product ID above to view its variants.
					</p>
				</div>
			) : (
				<div className="rounded-xl border bg-card p-4">
					<DataTable
						columns={columns}
						data={rows}
						isLoading={isLoading}
						rowCount={data?.total}
						paginationState={pagination}
						onPaginationChange={setPagination}
					/>
				</div>
			)}
		</div>
	);
}
