import { ArrowRight, Clock, Package, Warehouse } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { InventoryRow } from "./types";

interface StockDetailSheetProps {
	item: InventoryRow | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onAdjust: (item: InventoryRow) => void;
	onTransfer: (item: InventoryRow) => void;
}

function MetricCard({
	label,
	value,
	valueClass,
}: {
	label: string;
	value: number;
	valueClass?: string;
}) {
	return (
		<div className="flex flex-col gap-1 rounded-xl bg-muted/50 p-3">
			<p className="text-xs text-muted-foreground">{label}</p>
			<p className={cn("text-xl font-semibold tabular-nums", valueClass)}>
				{value}
			</p>
		</div>
	);
}

export function StockDetailSheet({
	item,
	open,
	onOpenChange,
	onAdjust,
	onTransfer,
}: StockDetailSheetProps) {
	if (!item) return null;

	const isLow = item.status === "LOW_STOCK";
	const isOut = item.status === "OUT_OF_STOCK";
	const availableClass =
		item.quantityAvailable === 0
			? "text-red-600"
			: item.quantityAvailable <= 5
				? "text-amber-600"
				: undefined;

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent
				side="right"
				className="sm:max-w-120 overflow-y-auto flex flex-col gap-0 p-0"
			>
				{/* Header */}
				<SheetHeader className="px-6 pt-6 pb-4">
					<div className="flex items-start justify-between gap-2">
						<div className="flex flex-col gap-1">
							<SheetTitle className="text-lg leading-tight">
								{item.variantName}
							</SheetTitle>
							<SheetDescription asChild>
								<div className="flex items-center gap-2 flex-wrap">
									<code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded-md">
										{item.sku}
									</code>
									<span className="flex items-center gap-1 text-xs text-muted-foreground">
										<Warehouse className="size-3" />
										{item.warehouseName}
									</span>
								</div>
							</SheetDescription>
						</div>
						<StatusBadge status={item.status} />
					</div>
				</SheetHeader>

				<Separator />

				{/* Metrics */}
				<div className="px-6 py-4 flex flex-col gap-4">
					<div className="grid grid-cols-3 gap-2">
						<MetricCard label="On Hand" value={item.quantityOnHand} />
						<MetricCard
							label="Reserved"
							value={item.quantityReserved}
							valueClass="text-muted-foreground"
						/>
						<MetricCard
							label="Available"
							value={item.quantityAvailable}
							valueClass={availableClass}
						/>
					</div>

					{/* Reorder Point */}
					<div className="flex items-center justify-between rounded-xl border px-4 py-3">
						<div className="flex flex-col gap-0.5">
							<p className="text-xs text-muted-foreground">Reorder Point</p>
							<p className="text-sm font-medium tabular-nums">
								{item.reorderPoint} units
							</p>
						</div>
						{(isLow || isOut) && (
							<Badge
								className={cn(
									"text-xs shrink-0",
									isOut
										? "bg-badge-out-of-stock/10 text-badge-out-of-stock border border-badge-out-of-stock/20"
										: "bg-badge-low-stock/10 text-badge-low-stock border border-badge-low-stock/20",
								)}
							>
								{isOut ? "Out of stock" : "Below threshold"}
							</Badge>
						)}
					</div>
				</div>

				<Separator />

				{/* Quick Actions */}
				<div className="px-6 py-4 flex flex-col gap-2">
					<p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
						Actions
					</p>
					<div className="flex flex-wrap gap-2">
						<Button
							variant="outline"
							size="sm"
							className="flex-1"
							onClick={() => onAdjust(item)}
						>
							<Package className="size-3.5 mr-1.5" />
							Adjust Stock
						</Button>
						<Button
							variant="outline"
							size="sm"
							className="flex-1"
							onClick={() => onTransfer(item)}
						>
							<ArrowRight className="size-3.5 mr-1.5" />
							Transfer
						</Button>
					</div>
				</div>

				<Separator />

				{/* Recent Movements — placeholder until movement history query is wired */}
				<div className="px-6 py-4 flex flex-col gap-3 flex-1">
					<p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
						Recent Movements
					</p>
					<div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
						<Clock className="size-8 text-muted-foreground/40" />
						<p className="text-sm text-muted-foreground">
							Movement history coming soon.
						</p>
					</div>
					{/* TODO: wire up useGetMovementsQuery(item.variantId, item.warehouseId) */}
				</div>
			</SheetContent>
		</Sheet>
	);
}

function StatusBadge({ status }: { status: InventoryRow["status"] }) {
	switch (status) {
		case "IN_STOCK":
			return (
				<Badge className="bg-badge-in-stock/10 text-badge-in-stock border border-badge-in-stock/20 text-xs shrink-0">
					In Stock
				</Badge>
			);
		case "LOW_STOCK":
			return (
				<Badge className="bg-badge-low-stock/10 text-badge-low-stock border border-badge-low-stock/20 text-xs shrink-0">
					Low Stock
				</Badge>
			);
		case "OUT_OF_STOCK":
			return (
				<Badge className="bg-badge-out-of-stock/10 text-badge-out-of-stock border border-badge-out-of-stock/20 text-xs shrink-0">
					Out of Stock
				</Badge>
			);
	}
}
