import { ArrowLeft, Minus, Package, Plus, Search, X } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { buildSearchableVariants } from "../data/mock-data";
import type { SearchableVariant, StockActionType, StockStatus } from "../types";
import { StockActionSheet } from "./stock-action-sheet";

const statusLabel: Record<StockStatus, string> = {
	"in-stock": "In Stock",
	"low-stock": "Low Stock",
	"out-of-stock": "Out of Stock",
};

const statusVariant: Record<
	StockStatus,
	"default" | "outline" | "destructive"
> = {
	"in-stock": "default",
	"low-stock": "outline",
	"out-of-stock": "destructive",
};

export default function StockOperationsPage() {
	const allVariants = useMemo(() => buildSearchableVariants(), []);

	const [query, setQuery] = useState("");
	const [selectedVariant, setSelectedVariant] =
		useState<SearchableVariant | null>(null);
	const [sheetOpen, setSheetOpen] = useState(false);
	const [actionType, setActionType] = useState<StockActionType>("add");
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	const results = useMemo(() => {
		if (!query.trim()) return [];
		const q = query.toLowerCase();
		return allVariants.filter(
			(v) =>
				v.name.toLowerCase().includes(q) ||
				v.sku.toLowerCase().includes(q) ||
				v.barcode?.toLowerCase().includes(q) ||
				v.product.name.toLowerCase().includes(q) ||
				Object.values(v.options).some((opt) =>
					String(opt).toLowerCase().includes(q),
				),
		);
	}, [query, allVariants]);

	const showDropdown =
		isDropdownOpen && query.trim().length > 0 && !selectedVariant;

	const handleSelect = useCallback((variant: SearchableVariant) => {
		setSelectedVariant(variant);
		setQuery(variant.name);
		setIsDropdownOpen(false);
		inputRef.current?.blur();
	}, []);

	const handleClear = useCallback(() => {
		setSelectedVariant(null);
		setQuery("");
		inputRef.current?.focus();
	}, []);

	const handleAction = useCallback(
		(action: StockActionType) => {
			if (!selectedVariant) return;
			setActionType(action);
			setSheetOpen(true);
		},
		[selectedVariant],
	);

	return (
		<div className="flex flex-1 flex-col gap-6 p-4 pt-0 animate-stagger-children">
			<div>
				<h1 className="text-xl font-semibold">Stock Operations</h1>
				<p className="text-sm text-muted-foreground">
					Search for a product to add or deduct stock.
				</p>
			</div>

			<div
				className={cn(
					"relative mx-auto w-full transition-all duration-300",
					selectedVariant ? "max-w-full" : "max-w-2xl",
				)}
			>
				<div className="relative">
					{selectedVariant ? (
						<button
							type="button"
							onClick={handleClear}
							className="absolute left-3.5 top-1/2 z-10 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
						>
							<ArrowLeft className="h-4 w-4" />
						</button>
					) : (
						<Search className="pointer-events-none absolute left-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
					)}
					<Input
						ref={inputRef}
						value={query}
						onChange={(e) => {
							setQuery(e.target.value);
							if (selectedVariant) setSelectedVariant(null);
							setIsDropdownOpen(true);
						}}
						onFocus={() => {
							if (!selectedVariant) setIsDropdownOpen(true);
						}}
						onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
						placeholder="Search by product name, SKU, barcode, or variant..."
						className={cn(
							"h-12 rounded-2xl pl-11 text-base transition-all duration-300 md:text-base",
							isDropdownOpen && query.trim()
								? "ring-3 ring-ring/50 border-ring shadow-lg"
								: "shadow-sm hover:shadow-md",
							query && "pr-10",
						)}
					/>
					{query && (
						<button
							type="button"
							onClick={handleClear}
							className="absolute right-3.5 top-1/2 z-10 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
						>
							<X className="h-4 w-4" />
						</button>
					)}

					{showDropdown && (
						<div className="absolute top-full left-0 z-20 mt-2 w-full">
							<div className="rounded-2xl border border-border bg-card shadow-xl animate-apple-enter">
								{results.length === 0 ? (
									<div className="flex flex-col items-center gap-2 py-12 text-center">
										<Package className="h-10 w-10 text-muted-foreground/40" />
										<p className="text-sm text-muted-foreground">
											No variants match "{query}"
										</p>
									</div>
								) : (
									<div className="max-h-[420px] overflow-y-auto p-2">
										<p className="px-3 py-1.5 text-xs font-medium text-muted-foreground">
											{results.length} result{results.length > 1 ? "s" : ""}
										</p>
										{results.map((v) => (
											<button
												key={v.id}
												type="button"
												className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-muted/60"
												onMouseDown={(e) => {
													e.preventDefault();
													handleSelect(v);
												}}
											>
												<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted/80">
													<Package className="h-5 w-5 text-muted-foreground" />
												</div>
												<div className="min-w-0 flex-1">
													<div className="flex items-center gap-2">
														<p className="truncate text-sm font-medium">
															{v.name}
														</p>
														<Badge variant={statusVariant[v.overallStatus]}>
															{statusLabel[v.overallStatus]}
														</Badge>
													</div>
													<div className="flex items-center gap-2 text-xs text-muted-foreground">
														<span className="font-mono">{v.sku}</span>
														<span className="text-border">·</span>
														<span>{v.product.brandName}</span>
														<span className="text-border">·</span>
														<span>
															{v.totalAvailable.toLocaleString()} {v.baseUom}{" "}
															available
														</span>
													</div>
												</div>
											</button>
										))}
									</div>
								)}
							</div>
						</div>
					)}
				</div>
			</div>

			{!selectedVariant && !query.trim() && (
				<div className="flex flex-1 flex-col items-center justify-center gap-3 py-20 text-center">
					<div className="rounded-2xl bg-muted/60 p-4">
						<Search className="h-8 w-8 text-muted-foreground/60" />
					</div>
					<p className="text-sm font-medium text-muted-foreground">
						Start typing to find a variant
					</p>
					<p className="max-w-sm text-xs text-muted-foreground/80">
						Search by product name, SKU, barcode, or variant option to add or
						deduct stock.
					</p>
				</div>
			)}

			{selectedVariant && (
				<div className="animate-apple-enter space-y-6">
					<Card>
						<CardHeader className="flex-row items-center justify-between border-b">
							<div className="flex items-center gap-3">
								<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted/80">
									<Package className="h-5 w-5 text-muted-foreground" />
								</div>
								<div>
									<CardTitle>{selectedVariant.name}</CardTitle>
									<div className="flex items-center gap-2 text-xs text-muted-foreground">
										<span className="font-mono">{selectedVariant.sku}</span>
										{selectedVariant.barcode && (
											<>
												<span className="text-border">·</span>
												<span className="font-mono">
													{selectedVariant.barcode}
												</span>
											</>
										)}
										<span className="text-border">·</span>
										<span>{selectedVariant.product.brandName}</span>
										<span className="text-border">·</span>
										<span>{selectedVariant.product.categoryName}</span>
									</div>
								</div>
							</div>
							<div className="flex items-center gap-2">
								<Badge variant={statusVariant[selectedVariant.overallStatus]}>
									{statusLabel[selectedVariant.overallStatus]}
								</Badge>
								<Separator orientation="vertical" className="h-6" />
								<Button
									size="sm"
									className="gap-1.5"
									onClick={() => handleAction("add")}
								>
									<Plus className="h-3.5 w-3.5" />
									Add Stock
								</Button>
								<Button
									size="sm"
									variant="outline"
									className="gap-1.5"
									onClick={() => handleAction("deduct")}
								>
									<Minus className="h-3.5 w-3.5" />
									Deduct Stock
								</Button>
							</div>
						</CardHeader>
						<CardContent className="p-0">
							<div className="grid grid-cols-3 divide-x border-b">
								<div className="px-4 py-3">
									<p className="text-xs text-muted-foreground">Total On Hand</p>
									<p className="text-xl font-semibold tabular-nums">
										{selectedVariant.totalOnHand.toLocaleString()}
										<span className="ml-1 text-sm font-normal text-muted-foreground">
											{selectedVariant.baseUom}
										</span>
									</p>
								</div>
								<div className="px-4 py-3">
									<p className="text-xs text-muted-foreground">Available</p>
									<p className="text-xl font-semibold tabular-nums">
										{selectedVariant.totalAvailable.toLocaleString()}
										<span className="ml-1 text-sm font-normal text-muted-foreground">
											{selectedVariant.baseUom}
										</span>
									</p>
								</div>
								<div className="px-4 py-3">
									<p className="text-xs text-muted-foreground">Tracking</p>
									<p className="text-sm font-medium">
										{selectedVariant.trackingType}
									</p>
								</div>
							</div>

							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Warehouse</TableHead>
										<TableHead className="text-right">On Hand</TableHead>
										<TableHead className="text-right">Reserved</TableHead>
										<TableHead className="text-right">Available</TableHead>
										<TableHead className="text-right">Reorder Point</TableHead>
										<TableHead>Status</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{selectedVariant.inventoryItems.map((item) => (
										<TableRow key={item.warehouseId}>
											<TableCell>
												<div>
													<p className="font-medium">{item.warehouseName}</p>
													<p className="text-xs text-muted-foreground font-mono">
														{item.warehouseCode}
													</p>
												</div>
											</TableCell>
											<TableCell className="text-right tabular-nums">
												{item.quantityOnHand.toLocaleString()}
											</TableCell>
											<TableCell className="text-right tabular-nums">
												{item.quantityReserved.toLocaleString()}
											</TableCell>
											<TableCell className="text-right tabular-nums font-medium">
												{item.quantityAvailable.toLocaleString()}
											</TableCell>
											<TableCell className="text-right tabular-nums text-muted-foreground">
												{item.reorderPoint.toLocaleString()}
											</TableCell>
											<TableCell>
												<Badge variant={statusVariant[item.status]}>
													{statusLabel[item.status]}
												</Badge>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</CardContent>
					</Card>
				</div>
			)}

			<StockActionSheet
				open={sheetOpen}
				onOpenChange={setSheetOpen}
				variant={selectedVariant}
				action={actionType}
			/>
		</div>
	);
}
