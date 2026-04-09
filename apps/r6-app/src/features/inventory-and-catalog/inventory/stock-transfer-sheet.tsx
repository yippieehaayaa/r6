import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useTransferStockMutation } from "@/api/inventory-and-catalog";
import { useAuth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import type { InventoryRow } from "./types";

interface WarehouseOption {
	id: string;
	name: string;
}

interface StockTransferSheetProps {
	item: InventoryRow | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	warehouses: WarehouseOption[];
	onTransferred?: () => void;
}

export function StockTransferSheet({
	item,
	open,
	onOpenChange,
	warehouses,
	onTransferred,
}: StockTransferSheetProps) {
	const { profile } = useAuth();
	const transferMutation = useTransferStockMutation();

	const [toWarehouseId, setToWarehouseId] = useState("");
	const [qty, setQty] = useState("");

	useEffect(() => {
		if (open) {
			setToWarehouseId("");
			setQty("");
		}
	}, [open]);

	const parsedQty = Number.parseInt(qty || "0", 10);
	const available = item?.quantityAvailable ?? 0;
	const afterTransfer = available - parsedQty;
	const isQtyValid = parsedQty > 0 && parsedQty <= available;
	const canSubmit =
		!!toWarehouseId && isQtyValid && !transferMutation.isPending;

	const destinationWarehouse = warehouses.find((w) => w.id === toWarehouseId);

	const eligibleWarehouses = warehouses.filter(
		(w) => w.id !== item?.warehouseId,
	);

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!item || !canSubmit) return;
		transferMutation.mutate(
			{
				variantId: item.variantId,
				fromWarehouseId: item.warehouseId,
				toWarehouseId,
				qty: parsedQty,
				performedBy: profile?.username ?? "system",
			},
			{
				onSuccess: () => {
					toast.success(
						`Transferred ${parsedQty} unit${parsedQty > 1 ? "s" : ""} to ${destinationWarehouse?.name}.`,
					);
					onTransferred?.();
					onOpenChange(false);
				},
				onError: () => toast.error("Transfer failed. Please try again."),
			},
		);
	}

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="sm:max-w-md overflow-y-auto animate-stagger-children">
				<SheetHeader>
					<SheetTitle>Transfer Stock</SheetTitle>
					<SheetDescription>
						{item ? (
							<span>
								{item.variantName}
								<code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded-md ml-2">
									{item.sku}
								</code>
							</span>
						) : (
							"Move stock between warehouses."
						)}
					</SheetDescription>
				</SheetHeader>

				<form onSubmit={handleSubmit} className="flex flex-col gap-4 px-4 py-4">
					{/* From */}
					<div className="rounded-lg bg-muted/50 p-4 flex flex-col gap-1">
						<p className="text-xs text-muted-foreground">From</p>
						<p className="text-sm font-medium">
							{item?.warehouseName ?? "—"}
						</p>
						<p className="text-xs text-muted-foreground tabular-nums">
							{available} units available
						</p>
					</div>

					{/* To */}
					<Field>
						<FieldLabel>To Warehouse</FieldLabel>
						<Select value={toWarehouseId} onValueChange={setToWarehouseId}>
							<SelectTrigger>
								<SelectValue placeholder="Select destination…" />
							</SelectTrigger>
							<SelectContent>
								{eligibleWarehouses.length === 0 ? (
									<SelectItem value="__none" disabled>
										No other warehouses
									</SelectItem>
								) : (
									eligibleWarehouses.map((w) => (
										<SelectItem key={w.id} value={w.id}>
											{w.name}
										</SelectItem>
									))
								)}
							</SelectContent>
						</Select>
					</Field>

					{/* Qty */}
					<Field>
						<FieldLabel>Quantity</FieldLabel>
						<Input
							type="number"
							min={1}
							max={available}
							value={qty}
							onChange={(e) => setQty(e.target.value)}
							placeholder={`1 – ${available}`}
						/>
					</Field>

					{/* Preview */}
					{parsedQty > 0 && toWarehouseId && (
						<div className="rounded-lg border border-border/50 p-4 flex flex-col gap-1.5">
							<p className="text-xs text-muted-foreground">After transfer</p>
							<div className="flex items-center gap-2 text-sm">
								<span className="font-medium tabular-nums">{available}</span>
								<span className="text-muted-foreground">→</span>
								<span
									className={`font-semibold tabular-nums ${afterTransfer < 0 ? "text-destructive" : afterTransfer === 0 ? "text-red-600" : "text-foreground"}`}
								>
									{afterTransfer}
								</span>
								<span className="text-xs text-muted-foreground">
									in {item?.warehouseName}
								</span>
							</div>
							{afterTransfer < 0 && (
								<p className="text-xs text-destructive">
									Quantity exceeds available stock.
								</p>
							)}
						</div>
					)}

					<SheetFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={!canSubmit}>
							{transferMutation.isPending ? "Transferring…" : "Transfer"}
						</Button>
					</SheetFooter>
				</form>
			</SheetContent>
		</Sheet>
	);
}
