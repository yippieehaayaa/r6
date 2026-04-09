import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAdjustStockMutation } from "@/api/inventory-and-catalog";
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
import type { InventoryRow } from "./page";

const REASONS = [
	{ value: "RECOUNT", label: "Stock Recount" },
	{ value: "RECEIVED", label: "Received Shipment" },
	{ value: "DAMAGED", label: "Damaged / Lost" },
	{ value: "RETURNED", label: "Customer Return" },
];

interface StockAdjustSheetProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	item: InventoryRow | null;
	onAdjust: (id: string, newQty: number) => void;
}

export function StockAdjustSheet({
	open,
	onOpenChange,
	item,
	onAdjust,
}: StockAdjustSheetProps) {
	const { profile } = useAuth();
	const adjustMutation = useAdjustStockMutation();
	const [adjustment, setAdjustment] = useState("");
	const [reason, setReason] = useState("RECOUNT");

	useEffect(() => {
		if (open) {
			setAdjustment("");
			setReason("RECOUNT");
		}
	}, [open]);

	const current = item?.quantityOnHand ?? 0;
	const delta = Number.parseInt(adjustment || "0", 10);
	const newQty = current + delta;

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!item) return;
		adjustMutation.mutate(
			{
				variantId: item.variantId,
				warehouseId: item.warehouseId,
				delta,
				notes: reason,
				performedBy: profile?.username ?? "system",
			},
			{
				onSuccess: () => {
					onAdjust(item.id, newQty);
					toast.success(`Stock adjusted to ${newQty} units.`);
					onOpenChange(false);
				},
				onError: () => toast.error("Failed to adjust stock."),
			},
		);
	}

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="sm:max-w-md overflow-y-auto animate-stagger-children">
				<SheetHeader>
					<SheetTitle>Adjust Stock</SheetTitle>
					<SheetDescription>
						{item
							? `${item.productName} — ${item.variantName}`
							: "Adjust inventory quantity."}
					</SheetDescription>
				</SheetHeader>
				<form onSubmit={handleSubmit} className="flex flex-col gap-4 px-4 py-4">
					<div className="rounded-lg bg-muted/50 p-4 flex flex-col gap-1">
						<p className="text-xs text-muted-foreground">Current Quantity</p>
						<p className="text-2xl font-semibold">{current}</p>
						<p className="text-xs text-muted-foreground">
							{item?.warehouseName ?? "—"}
						</p>
					</div>

					<Field>
						<FieldLabel>Adjustment (+ or −)</FieldLabel>
						<Input
							type="number"
							value={adjustment}
							onChange={(e) => setAdjustment(e.target.value)}
							placeholder="e.g. +10 or -3"
						/>
					</Field>

					<div className="rounded-lg border border-border/50 p-4 flex items-center justify-between">
						<span className="text-sm text-muted-foreground">New Quantity</span>
						<span
							className={`text-xl font-semibold ${newQty < 0 ? "text-destructive" : newQty === 0 ? "text-red-600" : "text-green-600"}`}
						>
							{Number.isNaN(newQty) ? current : newQty}
						</span>
					</div>

					<Field>
						<FieldLabel>Reason</FieldLabel>
						<Select value={reason} onValueChange={setReason}>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{REASONS.map((r) => (
									<SelectItem key={r.value} value={r.value}>
										{r.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</Field>

					<SheetFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={!adjustment || newQty < 0 || adjustMutation.isPending}
						>
							{adjustMutation.isPending ? "Saving..." : "Apply Adjustment"}
						</Button>
					</SheetFooter>
				</form>
			</SheetContent>
		</Sheet>
	);
}
