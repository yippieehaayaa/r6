import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

export interface BrandRow {
	id: string;
	name: string;
	slug: string;
	logoUrl?: string;
	productsCount: number;
	status: string;
}

export const columns: ColumnDef<BrandRow>[] = [
	{
		accessorKey: "name",
		header: "Name",
		cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
	},
	{
		accessorKey: "slug",
		header: "Slug",
		cell: ({ row }) => (
			<span className="font-mono text-xs text-muted-foreground">
				{row.original.slug}
			</span>
		),
	},
	{
		accessorKey: "logoUrl",
		header: "Logo",
		cell: ({ row }) => {
			const { logoUrl, name } = row.original;
			if (logoUrl) {
				return (
					<img
						src={logoUrl}
						alt={name}
						className="h-8 w-8 rounded object-contain"
					/>
				);
			}
			return (
				<span className="text-xs text-muted-foreground italic">No logo</span>
			);
		},
	},
	{
		accessorKey: "productsCount",
		header: "Products Count",
		cell: ({ row }) => (
			<span className="text-muted-foreground">
				{row.original.productsCount}
			</span>
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
