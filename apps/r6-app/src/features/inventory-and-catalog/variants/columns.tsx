import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

export interface VariantRow {
	id: string;
	name: string;
	sku: string;
	attributes: string;
	productName: string;
	status: string;
}

export const columns: ColumnDef<VariantRow>[] = [
	{
		accessorKey: "name",
		header: "Name",
		cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
	},
	{
		accessorKey: "sku",
		header: "SKU",
		cell: ({ row }) => (
			<span className="font-mono text-xs text-muted-foreground">
				{row.original.sku}
			</span>
		),
	},
	{
		accessorKey: "attributes",
		header: "Attributes",
		cell: ({ row }) => (
			<span className="text-muted-foreground">{row.original.attributes}</span>
		),
	},
	{
		accessorKey: "productName",
		header: "Product",
		cell: ({ row }) => (
			<span className="text-muted-foreground">{row.original.productName}</span>
		),
	},
	{
		accessorKey: "status",
		header: "Status",
		cell: ({ row }) => (
			<Badge
				variant={row.original.status === "Active" ? "default" : "secondary"}
			>
				{row.original.status}
			</Badge>
		),
	},
];
