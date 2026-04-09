import type { InventoryItemEnriched } from "@r6/schemas";
import { AlertTriangle } from "lucide-react";
import { useMemo, useState } from "react";
import {
	useGetInStockItemsQuery,
	useGetLowStockItemsQuery,
	useGetOutOfStockItemsQuery,
	useGetStockCountsQuery,
	useListWarehousesQuery,
} from "@/api/inventory-and-catalog";
import { Button } from "@/components/ui/button";
import { type InventoryRow, InventoryTable } from "./inventory-table";
import { StockAdjustSheet } from "./stock-adjust-sheet";

function computeStatus(
	onHand: number,
	reorderPoint: number,
): InventoryRow["status"] {
	if (onHand === 0) return "OUT_OF_STOCK";
	if (onHand <= reorderPoint) return "LOW_STOCK";
	return "IN_STOCK";
}

function mapInventoryItem(item: InventoryItemEnriched): InventoryRow {
	return {
		id: item.id,
		variantName: item.variantName,
		sku: item.sku,
		variantId: item.variantId,
		warehouseId: item.warehouseId,
		warehouseName: item.warehouseName,
		quantityOnHand: item.quantityOnHand,
		quantityReserved: item.quantityReserved,
		quantityAvailable: item.quantityOnHand - item.quantityReserved,
		reorderPoint: item.reorderPoint,
		status: computeStatus(item.quantityOnHand, item.reorderPoint),
		updatedAt: item.updatedAt,
	};
}

export default function InventoryPage() {
	const [search, setSearch] = useState("");
	const [warehouseFilter, setWarehouseFilter] = useState("all");
	const [statusFilter, setStatusFilter] = useState("all");
	const [adjustSheetOpen, setAdjustSheetOpen] = useState(false);
	const [selectedItem, setSelectedItem] = useState<InventoryRow | null>(null);
	const [localOverrides, setLocalOverrides] = useState<Record<string, number>>(
		{},
	);

	const warehouseId =
		warehouseFilter !== "all" ? warehouseFilter : undefined;

	const { data: warehousesData } = useListWarehousesQuery({ limit: 100 });
	const warehouses = warehousesData?.data ?? [];

	const { data: counts } = useGetStockCountsQuery(warehouseId);
	const { data: inStockData, isLoading: inStockLoading } =
		useGetInStockItemsQuery(warehouseId);
	const { data: lowStockData, isLoading: lowStockLoading } =
		useGetLowStockItemsQuery(warehouseId);
	const { data: outOfStockData, isLoading: outOfStockLoading } =
		useGetOutOfStockItemsQuery(warehouseId);

	const isLoading = inStockLoading || lowStockLoading || outOfStockLoading;

	const allItems = useMemo(() => {
		const raw = [
			...(inStockData ?? []),
			...(lowStockData ?? []),
			...(outOfStockData ?? []),
		].map(mapInventoryItem);

		return raw.map((row) => {
			const override = localOverrides[row.id];
			if (override !== undefined) {
				return {
					...row,
					quantityOnHand: override,
					quantityAvailable: override - row.quantityReserved,
					status: computeStatus(override, row.reorderPoint),
				};
			}
			return row;
		});
	}, [inStockData, lowStockData, outOfStockData, localOverrides]);

	const filtered = useMemo(() => {
		return allItems.filter((item) => {
			const matchesStatus =
				statusFilter === "all" || item.status === statusFilter;
			return matchesStatus;
		});
	}, [allItems, statusFilter]);

	function handleAdjust(item: InventoryRow) {
		setSelectedItem(item);
		setAdjustSheetOpen(true);
	}

	function handleStockAdjust(id: string, newQty: number) {
		setLocalOverrides((prev) => ({ ...prev, [id]: newQty }));
	}

	return (
		<div className="flex flex-1 flex-col gap-4 p-4 pt-0 animate-stagger-children">
			<StockAdjustSheet
				open={adjustSheetOpen}
				onOpenChange={setAdjustSheetOpen}
				item={selectedItem}
				onAdjust={handleStockAdjust}
			/>

			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-xl font-semibold">Inventory</h1>
					<p className="text-sm text-muted-foreground">
						Track stock levels across all locations.
					</p>
				</div>
			</div>

			{/* Low Stock Alert */}
			{(counts?.lowStock ?? 0) > 0 && (
				<div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 flex items-center gap-3">
					<AlertTriangle className="size-5 shrink-0" />
					<span className="text-sm font-medium">
						{counts!.lowStock} product
						{counts!.lowStock > 1 ? "s are" : " is"} low on stock.
					</span>
					<Button
						variant="link"
						className="text-amber-800 underline p-0 h-auto ml-auto"
						onClick={() => setStatusFilter("LOW_STOCK")}
					>
						Review
					</Button>
				</div>
			)}

			{/* Stats */}
			<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
				{[
					{ label: "Total Items", value: counts?.total ?? "—" },
					{ label: "In Stock", value: counts?.inStock ?? "—" },
					{ label: "Low Stock", value: counts?.lowStock ?? "—" },
					{ label: "Out of Stock", value: counts?.outOfStock ?? "—" },
				].map((stat) => (
					<div key={stat.label} className="rounded-xl border bg-card p-4">
						<p className="text-xs text-muted-foreground">{stat.label}</p>
						<p className="text-2xl font-semibold mt-1">{stat.value}</p>
					</div>
				))}
			</div>

			{/* Table */}
			<div className="rounded-xl border bg-card p-4">
				<InventoryTable
					data={filtered}
					isLoading={isLoading}
					onAdjust={handleAdjust}
					warehouses={warehouses}
					warehouseFilter={warehouseFilter}
					onWarehouseFilterChange={setWarehouseFilter}
					statusFilter={statusFilter}
					onStatusFilterChange={setStatusFilter}
					filterValue={search}
					onFilterChange={setSearch}
				/>
			</div>
		</div>
	);
}

