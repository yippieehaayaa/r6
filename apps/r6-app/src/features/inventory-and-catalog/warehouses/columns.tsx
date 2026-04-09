import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

export interface WarehouseRow {
	id: string;
	name: string;
	location: string;
	capacity: number;
	status: string;
	createdAt: string;
}

export const columns: ColumnDef<WarehouseRow>[] = [
	{
		accessorKey: "name",
		header: "Name",
		cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
	},
	{
		accessorKey: "location",
		header: "Location",
		cell: ({ row }) => (
			<span className="text-muted-foreground">{row.original.location}</span>
		),
	},
	{
		accessorKey: "capacity",
		header: "Capacity",
		cell: ({ row }) => (
			<span className="text-muted-foreground">{row.original.capacity}</span>
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
	{
		accessorKey: "createdAt",
		header: "Created At",
		cell: ({ row }) => (
			<span className="text-muted-foreground text-xs">
				{new Date(row.original.createdAt).toLocaleDateString()}
			</span>
		),
	},
];
