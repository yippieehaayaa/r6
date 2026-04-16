import { AlertCircle, Minus, Package, Plus } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { SearchableVariant, StockActionType, StockStatus } from "../types";

const stockStatusLabel: Record<StockStatus, string> = {
	"in-stock": "In Stock",
	"low-stock": "Low Stock",
	"out-of-stock": "Out of Stock",
};

const stockStatusVariant: Record<
	StockStatus,
	"default" | "outline" | "destructive"
> = {
	"in-stock": "default",
	"low-stock": "outline",
	"out-of-stock": "destructive",
};

interface StockActionSheetProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	variant: SearchableVariant | null;
	action: StockActionType;
}

export function StockActionSheet({
	open,
	onOpenChange,
	variant,
	action,
}: StockActionSheetProps) {
	const [quantity, setQuantity] = useState("");
	const [warehouseId, setWarehouseId] = useState("");
	const [reason, setReason] = useState("");
	const [referenceId, setReferenceId] = useState("");
	const [notes, setNotes] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const isAdd = action === "add";
	const selectedWarehouse = variant?.inventoryItems.find(
		(i) => i.warehouseId === warehouseId,
	);

	const resetForm = useCallback(() => {
		setQuantity("");
		setWarehouseId("");
		setReason("");
		setReferenceId("");
		setNotes("");
	}, []);

	const handleOpenChange = useCallback(
		(value: boolean) => {
			if (!value) resetForm();
			onOpenChange(value);
		},
		[onOpenChange, resetForm],
	);

	const handleSubmit = useCallback(() => {
		if (!variant || !quantity || !warehouseId || !reason) return;

		setIsSubmitting(true);
		setTimeout(() => {
			toast.success(
				`${isAdd ? "Added" : "Deducted"} ${quantity} ${variant.baseUom} of ${variant.name}`,
			);
			setIsSubmitting(false);
			handleOpenChange(false);
		}, 600);
	}, [variant, quantity, warehouseId, reason, isAdd, handleOpenChange]);

	if (!variant) return null;

	const qtyNum = Number(quantity) || 0;
	const canSubmit = qtyNum > 0 && warehouseId && reason.trim().length > 0;
	const wouldExceedAvailable =
		!isAdd && selectedWarehouse && qtyNum > selectedWarehouse.quantityAvailable;

	return (
		<Sheet open={open} onOpenChange={handleOpenChange}>
			<SheetContent className="sm:max-w-md">
				<SheetHeader>
					<div className="flex items-center gap-2">
						<div
							className={cn(
								"flex h-8 w-8 items-center justify-center rounded-lg",
								isAdd ? "bg-badge-in-stock/10" : "bg-badge-out-of-stock/10",
							)}
						>
							{isAdd ? (
								<Plus className="h-4 w-4 text-badge-in-stock" />
							) : (
								<Minus className="h-4 w-4 text-badge-out-of-stock" />
							)}
						</div>
						<SheetTitle>{isAdd ? "Add Stock" : "Deduct Stock"}</SheetTitle>
					</div>
					<SheetDescription>
						{isAdd
							? "Record incoming stock for this variant."
							: "Record a stock deduction for this variant."}
					</SheetDescription>
				</SheetHeader>

				<div className="flex flex-1 flex-col gap-5 overflow-y-auto px-4">
					<div className="flex items-center gap-3 rounded-xl border bg-muted/30 p-3">
						<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted/80">
							<Package className="h-5 w-5 text-muted-foreground" />
						</div>
						<div className="min-w-0 flex-1">
							<p className="truncate text-sm font-medium">{variant.name}</p>
							<div className="flex items-center gap-2 text-xs text-muted-foreground">
								<span className="font-mono">{variant.sku}</span>
								<Badge variant={stockStatusVariant[variant.overallStatus]}>
									{stockStatusLabel[variant.overallStatus]}
								</Badge>
							</div>
						</div>
					</div>

					<div className="space-y-1.5">
						<label htmlFor="warehouse-select" className="text-sm font-medium">
							Warehouse
						</label>
						<Select value={warehouseId} onValueChange={setWarehouseId}>
							<SelectTrigger>
								<SelectValue placeholder="Select warehouse" />
							</SelectTrigger>
							<SelectContent>
								{variant.inventoryItems.map((item) => (
									<SelectItem key={item.warehouseId} value={item.warehouseId}>
										<div className="flex w-full items-center justify-between gap-3">
											<span>{item.warehouseName}</span>
											<span className="text-xs text-muted-foreground">
												{item.quantityAvailable.toLocaleString()} avail
											</span>
										</div>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-1.5">
						<label htmlFor="stock-quantity" className="text-sm font-medium">
							Quantity
						</label>
						<Input
							id="stock-quantity"
							type="number"
							min={1}
							value={quantity}
							onChange={(e) => setQuantity(e.target.value)}
							placeholder={`Enter quantity in ${variant.baseUom}`}
						/>
						{wouldExceedAvailable && (
							<div className="flex items-center gap-1.5 text-xs text-badge-out-of-stock">
								<AlertCircle className="h-3.5 w-3.5" />
								Exceeds available stock ({selectedWarehouse.quantityAvailable}{" "}
								{variant.baseUom})
							</div>
						)}
					</div>

					<div className="space-y-1.5">
						<label htmlFor="stock-reason" className="text-sm font-medium">
							Reason
						</label>
						<Select value={reason} onValueChange={setReason}>
							<SelectTrigger>
								<SelectValue placeholder="Select reason" />
							</SelectTrigger>
							<SelectContent>
								{isAdd ? (
									<>
										<SelectItem value="Purchase order received">
											Purchase order received
										</SelectItem>
										<SelectItem value="Return to stock">
											Return to stock
										</SelectItem>
										<SelectItem value="Inventory count correction">
											Inventory count correction
										</SelectItem>
										<SelectItem value="Transfer received">
											Transfer received
										</SelectItem>
										<SelectItem value="Other">Other</SelectItem>
									</>
								) : (
									<>
										<SelectItem value="Damaged goods">Damaged goods</SelectItem>
										<SelectItem value="Expired stock">Expired stock</SelectItem>
										<SelectItem value="Inventory count correction">
											Inventory count correction
										</SelectItem>
										<SelectItem value="Samples / giveaway">
											Samples / giveaway
										</SelectItem>
										<SelectItem value="Theft / loss">Theft / loss</SelectItem>
										<SelectItem value="Other">Other</SelectItem>
									</>
								)}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-1.5">
						<label htmlFor="stock-ref-id" className="text-sm font-medium">
							Reference ID{" "}
							<span className="text-muted-foreground">(optional)</span>
						</label>
						<Input
							id="stock-ref-id"
							value={referenceId}
							onChange={(e) => setReferenceId(e.target.value)}
							placeholder="e.g. PO-2026-001"
						/>
					</div>

					<div className="space-y-1.5">
						<label htmlFor="stock-notes" className="text-sm font-medium">
							Notes <span className="text-muted-foreground">(optional)</span>
						</label>
						<Textarea
							id="stock-notes"
							value={notes}
							onChange={(e) => setNotes(e.target.value)}
							placeholder="Additional details..."
							rows={3}
						/>
					</div>
				</div>

				<SheetFooter className="gap-2 border-t pt-4">
					<Button
						variant="outline"
						className="flex-1"
						onClick={() => handleOpenChange(false)}
					>
						Cancel
					</Button>
					<Button
						className="flex-1"
						disabled={!canSubmit || isSubmitting}
						onClick={handleSubmit}
					>
						{isSubmitting
							? "Processing..."
							: isAdd
								? `Add ${qtyNum > 0 ? qtyNum.toLocaleString() : ""} ${variant.baseUom}`
								: `Deduct ${qtyNum > 0 ? qtyNum.toLocaleString() : ""} ${variant.baseUom}`}
					</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
