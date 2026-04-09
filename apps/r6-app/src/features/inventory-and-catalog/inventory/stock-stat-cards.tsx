import { memo } from "react";
import { cn } from "@/lib/utils";
import type { StockCounts, StockStatusFilter } from "./types";

interface StatConfig {
	key: StockStatusFilter;
	label: string;
	getValue: (c: StockCounts) => number;
	activeRing: string;
	activeText: string;
}

const STATS: StatConfig[] = [
	{
		key: "all",
		label: "Total Items",
		getValue: (c) => c.total,
		activeRing: "ring-2 ring-foreground/20",
		activeText: "",
	},
	{
		key: "IN_STOCK",
		label: "In Stock",
		getValue: (c) => c.inStock,
		activeRing: "ring-2 ring-badge-in-stock/40",
		activeText: "text-badge-in-stock",
	},
	{
		key: "LOW_STOCK",
		label: "Low Stock",
		getValue: (c) => c.lowStock,
		activeRing: "ring-2 ring-badge-low-stock/40",
		activeText: "text-badge-low-stock",
	},
	{
		key: "OUT_OF_STOCK",
		label: "Out of Stock",
		getValue: (c) => c.outOfStock,
		activeRing: "ring-2 ring-badge-out-of-stock/40",
		activeText: "text-badge-out-of-stock",
	},
];

interface StockStatCardsProps {
	counts: StockCounts | undefined;
	activeFilter: StockStatusFilter;
	onFilterChange: (filter: StockStatusFilter) => void;
}

export const StockStatCards = memo(function StockStatCards({
	counts,
	activeFilter,
	onFilterChange,
}: StockStatCardsProps) {
	return (
		<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
			{STATS.map(({ key, label, getValue, activeRing, activeText }) => {
				const isActive = activeFilter === key;
				const value = counts ? getValue(counts) : undefined;
				return (
					<button
						key={key}
						type="button"
						onClick={() =>
							onFilterChange(isActive && key !== "all" ? "all" : key)
						}
						className={cn(
							"rounded-xl border bg-card p-4 text-left transition-all duration-150 hover:shadow-xs hover:border-foreground/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
							isActive && activeRing,
						)}
					>
						<p className="text-xs text-muted-foreground">{label}</p>
						<p
							className={cn(
								"text-2xl font-semibold tabular-nums mt-1",
								isActive && activeText,
							)}
						>
							{value ?? "—"}
						</p>
					</button>
				);
			})}
		</div>
	);
});
