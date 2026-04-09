import type { StockMovement } from "@r6/schemas";
import type { ColumnDef, PaginationState } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
	useListDamagesQuery,
	useRecordDamageMutation,
} from "@/api/inventory-and-catalog";
import { useAuth } from "@/auth";
import { DataTable } from "@/components/table/data-table";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";

interface DamageLossRow {
	id: string;
	reference: string;
	warehouseName: string;
	reason: string;
	itemsAffected: number;
	date: string;
	reportedBy: string;
}

function mapDamage(m: StockMovement): DamageLossRow {
	return {
		id: m.id,
		reference: m.referenceId ?? m.id,
		warehouseName: m.warehouseId,
		reason: m.notes ?? "—",
		itemsAffected: Math.abs(m.quantity),
		date: m.createdAt,
		reportedBy: m.performedBy,
	};
}

const columns: ColumnDef<DamageLossRow>[] = [
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
		accessorKey: "warehouseName",
		header: "Warehouse",
		cell: ({ row }) => (
			<span className="text-muted-foreground">
				{row.original.warehouseName}
			</span>
		),
	},
	{
		accessorKey: "reason",
		header: "Reason",
		cell: ({ row }) => (
			<span className="text-muted-foreground">{row.original.reason}</span>
		),
	},
	{
		accessorKey: "itemsAffected",
		header: "Items Affected",
		cell: ({ row }) => (
			<span className="text-muted-foreground">
				{row.original.itemsAffected}
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
		accessorKey: "reportedBy",
		header: "Reported By",
		cell: ({ row }) => (
			<span className="text-muted-foreground">{row.original.reportedBy}</span>
		),
	},
];

interface RecordDamageSheetProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

function RecordDamageSheet({ open, onOpenChange }: RecordDamageSheetProps) {
	const { profile } = useAuth();
	const recordMutation = useRecordDamageMutation();

	const [variantId, setVariantId] = useState("");
	const [warehouseId, setWarehouseId] = useState("");
	const [qty, setQty] = useState("");
	const [notes, setNotes] = useState("");

	useEffect(() => {
		if (open) {
			setVariantId("");
			setWarehouseId("");
			setQty("");
			setNotes("");
		}
	}, [open]);

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		recordMutation.mutate(
			{
				variantId,
				warehouseId,
				qty: Number.parseInt(qty, 10),
				notes: notes || undefined,
				performedBy: profile?.username ?? "system",
			},
			{
				onSuccess: () => {
					toast.success("Damage recorded.");
					onOpenChange(false);
				},
				onError: () => toast.error("Failed to record damage."),
			},
		);
	}

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="sm:max-w-md overflow-y-auto animate-stagger-children">
				<SheetHeader>
					<SheetTitle>Record Damage</SheetTitle>
					<SheetDescription>
						Record damaged or lost inventory items.
					</SheetDescription>
				</SheetHeader>
				<form onSubmit={handleSubmit} className="flex flex-col gap-4 px-4 py-4">
					<Field>
						<FieldLabel>Variant ID *</FieldLabel>
						<Input
							value={variantId}
							onChange={(e) => setVariantId(e.target.value)}
							placeholder="Variant ID"
							required
						/>
					</Field>
					<Field>
						<FieldLabel>Warehouse ID *</FieldLabel>
						<Input
							value={warehouseId}
							onChange={(e) => setWarehouseId(e.target.value)}
							placeholder="Warehouse ID"
							required
						/>
					</Field>
					<Field>
						<FieldLabel>Quantity *</FieldLabel>
						<Input
							type="number"
							min="1"
							value={qty}
							onChange={(e) => setQty(e.target.value)}
							placeholder="Number of damaged items"
							required
						/>
					</Field>
					<Field>
						<FieldLabel>Notes</FieldLabel>
						<Textarea
							value={notes}
							onChange={(e) => setNotes(e.target.value)}
							placeholder="Describe the damage..."
							rows={3}
						/>
					</Field>
					<SheetFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={recordMutation.isPending}>
							{recordMutation.isPending ? "Saving..." : "Record Damage"}
						</Button>
					</SheetFooter>
				</form>
			</SheetContent>
		</Sheet>
	);
}

export default function DamageLossesPage() {
	const { hasPermission } = useAuth();
	const canRecord = hasPermission("inventory:stock:adjust");

	const [sheetOpen, setSheetOpen] = useState(false);
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 20,
	});

	const { data, isLoading } = useListDamagesQuery({
		page: pagination.pageIndex + 1,
		limit: pagination.pageSize,
	});

	const rows = useMemo(() => (data?.data ?? []).map(mapDamage), [data]);

	return (
		<div className="flex flex-1 flex-col gap-4 p-4 pt-0 animate-stagger-children">
			<RecordDamageSheet open={sheetOpen} onOpenChange={setSheetOpen} />

			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-xl font-semibold">Damage &amp; Losses</h1>
					<p className="text-sm text-muted-foreground">
						Record and review damaged or lost inventory items.
					</p>
				</div>
				{canRecord && (
					<Button onClick={() => setSheetOpen(true)}>
						<Plus className="size-4" />
						Report Damage
					</Button>
				)}
			</div>

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
		</div>
	);
}
