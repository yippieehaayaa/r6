import type { ColumnDef, PaginationState } from "@tanstack/react-table";
import { MoreHorizontal, Plus } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import {
	useDeleteBrandMutation,
	useListBrandsQuery,
} from "@/api/inventory-and-catalog";
import { useAuth } from "@/auth";
import { DataTable } from "@/components/table/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BrandRow {
	id: string;
	name: string;
	slug: string;
	logoUrl?: string;
	status: string;
}

export default function BrandsPage() {
	const { hasPermission } = useAuth();
	const canCreate = hasPermission("catalog:brand:create");
	const canDelete = hasPermission("catalog:brand:delete");

	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 20,
	});

	const queryParams = {
		page: pagination.pageIndex + 1,
		limit: pagination.pageSize,
	};

	const { data, isLoading } = useListBrandsQuery(queryParams);

	const deleteMutation = useDeleteBrandMutation();

	const handleDelete = useCallback(
		(id: string) => {
			deleteMutation.mutate(id, {
				onSuccess: () => toast.success("Brand deleted."),
				onError: () => toast.error("Failed to delete brand."),
			});
		},
		[deleteMutation],
	);

	const rows = useMemo(
		() =>
			(data?.data ?? []).map(
				(b): BrandRow => ({
					id: b.id,
					name: b.name,
					slug: b.slug,
					logoUrl: b.logoUrl,
					status: b.isActive ? "Active" : "Inactive",
				}),
			),
		[data],
	);

	const columns = useMemo<ColumnDef<BrandRow>[]>(
		() => [
			{
				accessorKey: "name",
				header: "Name",
				cell: ({ row }) => (
					<div className="flex items-center gap-3">
						{row.original.logoUrl ? (
							<img
								src={row.original.logoUrl}
								alt={row.original.name}
								className="h-8 w-8 rounded-lg object-contain border border-border/50"
							/>
						) : (
							<div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
								{row.original.name[0]}
							</div>
						)}
						<span className="font-medium">{row.original.name}</span>
					</div>
				),
			},
			{
				accessorKey: "slug",
				header: "Slug",
				cell: ({ row }) => (
					<span className="font-mono text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
						{row.original.slug}
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
			...(canDelete
				? [
						{
							id: "actions",
							header: "",
							cell: ({ row }: { row: { original: BrandRow } }) => (
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="ghost" size="icon" className="size-8">
											<MoreHorizontal className="size-4" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem
											className="text-destructive"
											onClick={() => handleDelete(row.original.id)}
										>
											Delete
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							),
						} satisfies ColumnDef<BrandRow>,
					]
				: []),
		],
		[canDelete, handleDelete],
	);

	return (
		<div className="flex flex-1 flex-col gap-4 p-4 pt-0 animate-stagger-children">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-xl font-semibold">Brands</h1>
					<p className="text-sm text-muted-foreground">
						Manage the brands associated with your product catalog.
					</p>
				</div>
				{canCreate && (
					<Button onClick={() => {}}>
						<Plus className="size-4" />
						Add Brand
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
