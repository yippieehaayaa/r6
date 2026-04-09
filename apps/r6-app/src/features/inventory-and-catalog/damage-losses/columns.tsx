import type { ColumnDef } from "@tanstack/react-table";

export interface DamageLossRow {
	id: string;
	reference: string;
	warehouseName: string;
	reason: string;
	itemsAffected: number;
	date: string;
	reportedBy: string;
}

export const columns: ColumnDef<DamageLossRow>[] = [
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
