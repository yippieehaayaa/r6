import type { StockMovement } from "@r6/schemas";
import type { ColumnDef, PaginationState } from "@tanstack/react-table";
import { PackageSearch } from "lucide-react";
import { useMemo, useState } from "react";
import { useListMovementsQuery } from "@/api/inventory-and-catalog";
import { DataTable } from "@/components/table/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface MovementRow {
	id: string;
	reference: string;
	type: "IN" | "OUT" | "TRANSFER";
	warehouseName: string;
	date: string;
	itemsCount: number;
	status: string;
}

function mapMovement(m: StockMovement): MovementRow {
	let type: "IN" | "OUT" | "TRANSFER" = "IN";
	if (m.type.startsWith("TRANSFER")) {
		type = "TRANSFER";
	} else if (m.quantity < 0) {
		type = "OUT";
	}
	return {
		id: m.id,
		reference: m.referenceId ?? m.id,
		type,
		warehouseName: m.warehouseId,
		date: m.createdAt,
		itemsCount: Math.abs(m.quantity),
		status: "Completed",
	};
}

const columns: ColumnDef<MovementRow>[] = [
	{
		accessorKey: "reference",
		header: "Reference",
		cell: ({ row }) => (
			<span className="font-medium font-mono text-xs">
				{row.original.reference}
			</span>
		),
	},
	{
		accessorKey: "type",
		header: "Type",
		cell: ({ row }) => {
			const type = row.original.type;
			const variant =
				type === "IN"
					? "default"
					: type === "OUT"
						? "destructive"
						: "secondary";
			return <Badge variant={variant}>{type}</Badge>;
		},
	},
	{
		accessorKey: "warehouseName",
		header: "Warehouse",
		cell: ({ row }) => (
			<span className="text-muted-foreground">
				{row.original.warehouseName}
			</span>
		),
	},
	{
		accessorKey: "date",
		header: "Date",
		cell: ({ row }) => (
			<span className="text-muted-foreground text-xs">
				{new Date(row.original.date).toLocaleDateString()}
			</span>
		),
	},
	{
		accessorKey: "itemsCount",
		header: "Qty",
		cell: ({ row }) => (
			<span className="text-muted-foreground">{row.original.itemsCount}</span>
		),
	},
	{
		accessorKey: "status",
		header: "Status",
		cell: ({ row }) => (
			<Badge
				variant={row.original.status === "Completed" ? "default" : "secondary"}
			>
				{row.original.status}
			</Badge>
		),
	},
];

export default function MovementsPage() {
	const [variantId, setVariantId] = useState("");
	const [variantIdInput, setVariantIdInput] = useState("");
	const [typeFilter, setTypeFilter] = useState("all");
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 20,
	});

	const { data, isLoading } = useListMovementsQuery(variantId, {
		page: pagination.pageIndex + 1,
		limit: pagination.pageSize,
		type: typeFilter !== "all" ? typeFilter : undefined,
	});

	const rows = useMemo(() => (data?.data ?? []).map(mapMovement), [data]);

	function handleSearch(e: React.FormEvent) {
		e.preventDefault();
		setPagination((p) => ({ ...p, pageIndex: 0 }));
		setVariantId(variantIdInput.trim());
	}

	return (
		<div className="flex flex-1 flex-col gap-4 p-4 pt-0 animate-stagger-children">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-xl font-semibold">Movements</h1>
					<p className="text-sm text-muted-foreground">
						Track stock movements across your warehouses.
					</p>
				</div>
			</div>

			{/* Variant search */}
			<div className="rounded-xl border bg-card p-4">
				<form
					onSubmit={handleSearch}
					className="flex flex-col gap-2 sm:flex-row sm:items-end"
				>
					<div className="flex-1 flex flex-col gap-1.5">
						<Label htmlFor="variantId">Variant ID</Label>
						<Input
							id="variantId"
							placeholder="Enter a variant ID to view its movements..."
							value={variantIdInput}
							onChange={(e) => setVariantIdInput(e.target.value)}
						/>
					</div>
					<Select
						value={typeFilter}
						onValueChange={(v) => {
							setTypeFilter(v);
							setPagination((p) => ({ ...p, pageIndex: 0 }));
						}}
					>
						<SelectTrigger className="sm:w-44">
							<SelectValue placeholder="All Types" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Types</SelectItem>
							<SelectItem value="RECEIPT">Receipt</SelectItem>
							<SelectItem value="SALE">Sale</SelectItem>
							<SelectItem value="ADJUSTMENT">Adjustment</SelectItem>
							<SelectItem value="TRANSFER_IN">Transfer In</SelectItem>
							<SelectItem value="TRANSFER_OUT">Transfer Out</SelectItem>
							<SelectItem value="RETURN">Return</SelectItem>
							<SelectItem value="DAMAGE">Damage</SelectItem>
						</SelectContent>
					</Select>
					<Button type="submit">Search</Button>
				</form>
			</div>

			{!variantId ? (
				<div className="rounded-xl border bg-card flex flex-col items-center justify-center gap-3 p-12 text-center">
					<PackageSearch className="size-10 text-muted-foreground/40" />
					<p className="text-sm font-medium">No variant selected</p>
					<p className="text-xs text-muted-foreground">
						Enter a variant ID above to view its stock movements.
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
