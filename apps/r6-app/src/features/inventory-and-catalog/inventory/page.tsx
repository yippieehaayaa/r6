import type { PaginationState } from "@tanstack/react-table";
import { AlertTriangle } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { StockStatus } from "@/api/inventory-and-catalog";
import {
	useGetStockCountsQuery,
	useListStockItemsQuery,
	useListWarehousesQuery,
} from "@/api/inventory-and-catalog";
import { Button } from "@/components/ui/button";
import { InventoryTable } from "./inventory-table";
import { StockAdjustSheet } from "./stock-adjust-sheet";
import { StockDetailSheet } from "./stock-detail-sheet";
import { StockStatCards } from "./stock-stat-cards";
import { StockTransferSheet } from "./stock-transfer-sheet";
import type { InventoryRow, StockCounts, StockStatusFilter } from "./types";
import { computeStatus } from "./types";

const PAGE_SIZE = 20;

export default function InventoryPage() {
	const [search, setSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [warehouseFilter, setWarehouseFilter] = useState("all");
	const [statusFilter, setStatusFilter] = useState<StockStatusFilter>("all");

	// Adjust sheet
	const [adjustSheetOpen, setAdjustSheetOpen] = useState(false);
	const [selectedAdjustItem, setSelectedAdjustItem] =
		useState<InventoryRow | null>(null);

	// Detail sheet
	const [detailSheetOpen, setDetailSheetOpen] = useState(false);
	const [selectedDetailItem, setSelectedDetailItem] =
		useState<InventoryRow | null>(null);

	// Transfer sheet
	const [transferSheetOpen, setTransferSheetOpen] = useState(false);
	const [selectedTransferItem, setSelectedTransferItem] =
		useState<InventoryRow | null>(null);

	const [localOverrides, setLocalOverrides] = useState<Record<string, number>>(
		{},
	);
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: PAGE_SIZE,
	});

	useEffect(() => {
		const id = setTimeout(() => setDebouncedSearch(search), 300);
		return () => clearTimeout(id);
	}, [search]);

	const warehouseId = warehouseFilter !== "all" ? warehouseFilter : undefined;
	const status =
		statusFilter !== "all" ? (statusFilter as StockStatus) : undefined;

	const { data: warehousesData } = useListWarehousesQuery({ limit: 100 });
	const warehouses = warehousesData?.data ?? [];

	const { data: counts } = useGetStockCountsQuery(warehouseId);

	const { data, isLoading } = useListStockItemsQuery({
		page: pagination.pageIndex + 1,
		limit: pagination.pageSize,
		search: debouncedSearch || undefined,
		warehouseId,
		status,
	});

	const rows: InventoryRow[] = useMemo(
		() =>
			(data?.data ?? []).map((item) => {
				const base: InventoryRow = {
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
				const override = localOverrides[item.id];
				if (override !== undefined) {
					return {
						...base,
						quantityOnHand: override,
						quantityAvailable: override - item.quantityReserved,
						status: computeStatus(override, item.reorderPoint),
					};
				}
				return base;
			}),
		[data, localOverrides],
	);

	const stockCounts: StockCounts | undefined = counts
		? {
				total: counts.total,
				inStock: counts.inStock,
				lowStock: counts.lowStock,
				outOfStock: counts.outOfStock,
			}
		: undefined;

	const handleRowClick = useCallback((item: InventoryRow) => {
		setSelectedDetailItem(item);
		setDetailSheetOpen(true);
	}, []);

	const handleAdjust = useCallback((item: InventoryRow) => {
		setSelectedAdjustItem(item);
		setAdjustSheetOpen(true);
	}, []);

	/** Open adjust from within the detail sheet — close detail first */
	const handleAdjustFromDetail = useCallback((item: InventoryRow) => {
		setDetailSheetOpen(false);
		setTimeout(() => {
			setSelectedAdjustItem(item);
			setAdjustSheetOpen(true);
		}, 150);
	}, []);

	const handleTransfer = useCallback((item: InventoryRow) => {
		setSelectedTransferItem(item);
		setTransferSheetOpen(true);
	}, []);

	/** Open transfer from within the detail sheet — close detail first */
	const handleTransferFromDetail = useCallback((item: InventoryRow) => {
		setDetailSheetOpen(false);
		setTimeout(() => {
			setSelectedTransferItem(item);
			setTransferSheetOpen(true);
		}, 150);
	}, []);

	const handleStockAdjust = useCallback((id: string, newQty: number) => {
		setLocalOverrides((prev) => ({ ...prev, [id]: newQty }));
	}, []);

	const handleWarehouseFilterChange = useCallback((value: string) => {
		setWarehouseFilter(value);
		setPagination((p) => ({ ...p, pageIndex: 0 }));
	}, []);

	const handleStatusFilterChange = useCallback(
		(filter: StockStatusFilter) => {
			setStatusFilter(filter);
			setPagination((p) => ({ ...p, pageIndex: 0 }));
		},
		[],
	);

	return (
		<div className="flex flex-1 flex-col gap-4 p-4 pt-0 animate-stagger-children">
			<StockAdjustSheet
				open={adjustSheetOpen}
				onOpenChange={setAdjustSheetOpen}
				item={selectedAdjustItem}
				onAdjust={handleStockAdjust}
			/>

			<StockDetailSheet
				open={detailSheetOpen}
				onOpenChange={setDetailSheetOpen}
				item={selectedDetailItem}
				onAdjust={handleAdjustFromDetail}
				onTransfer={handleTransferFromDetail}
			/>

			<StockTransferSheet
				open={transferSheetOpen}
				onOpenChange={setTransferSheetOpen}
				item={selectedTransferItem}
				warehouses={warehouses}
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
						onClick={() => {
							setStatusFilter("LOW_STOCK");
							setPagination((p) => ({ ...p, pageIndex: 0 }));
						}}
					>
						Review
					</Button>
				</div>
			)}

			{/* Stats — clicking a card filters the table */}
			<StockStatCards
				counts={stockCounts}
				activeFilter={statusFilter}
				onFilterChange={handleStatusFilterChange}
			/>

			{/* Table */}
			<div className="rounded-xl border bg-card p-4">
				<InventoryTable
					data={rows}
					isLoading={isLoading}
					onRowClick={handleRowClick}
					warehouses={warehouses}
					warehouseFilter={warehouseFilter}
					onWarehouseFilterChange={handleWarehouseFilterChange}
					filterValue={search}
					onFilterChange={(v) => {
						setSearch(v);
						setPagination((p) => ({ ...p, pageIndex: 0 }));
					}}
					rowCount={data?.total}
					paginationState={pagination}
					onPaginationChange={setPagination}
				/>
			</div>
		</div>
	);
}
