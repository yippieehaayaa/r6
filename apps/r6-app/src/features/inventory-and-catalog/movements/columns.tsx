import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

export interface MovementRow {
	id: string;
	reference: string;
	type: "IN" | "OUT" | "TRANSFER";
	warehouseName: string;
	date: string;
	itemsCount: number;
	status: string;
}

export const columns: ColumnDef<MovementRow>[] = [
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
		accessorKey: "type",
		header: "Type",
		cell: ({ row }) => {
			const type = row.original.type;
			const variant =
				type === "IN"
					? "default"
					: type === "OUT"
						? "destructive"
						: "secondary";
			return <Badge variant={variant}>{type}</Badge>;
		},
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
		accessorKey: "date",
		header: "Date",
		cell: ({ row }) => (
			<span className="text-muted-foreground text-xs">
				{new Date(row.original.date).toLocaleDateString()}
			</span>
		),
	},
	{
		accessorKey: "itemsCount",
		header: "Items Count",
		cell: ({ row }) => (
			<span className="text-muted-foreground">{row.original.itemsCount}</span>
		),
	},
	{
		accessorKey: "status",
		header: "Status",
		cell: ({ row }) => (
			<Badge
				variant={row.original.status === "Completed" ? "default" : "secondary"}
			>
				{row.original.status}
			</Badge>
		),
	},
];
