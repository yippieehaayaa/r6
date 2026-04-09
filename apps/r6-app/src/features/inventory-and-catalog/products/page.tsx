import type { Product } from "@r6/schemas";
import { useNavigate } from "@tanstack/react-router";
import type { ColumnDef, PaginationState } from "@tanstack/react-table";
import { Grid3x3, List, MoreHorizontal, Package, Plus } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import {
	useArchiveProductMutation,
	useDeleteProductMutation,
	useDiscontinueProductMutation,
	useListProductsQuery,
	usePublishProductMutation,
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
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ProductSheet } from "./product-sheet";

type ProductStatus = "DRAFT" | "ACTIVE" | "DISCONTINUED" | "ARCHIVED";

interface ProductRow {
	id: string;
	sku: string;
	name: string;
	slug: string;
	status: ProductStatus;
	categoryId: string;
	tags: string[];
}

const GRID_PAGE_SIZE = 8;

function getStatusBadgeClass(status: ProductStatus) {
	switch (status) {
		case "ACTIVE":
			return "bg-green-50 text-green-700 border border-green-200";
		case "DRAFT":
			return "bg-slate-100 text-slate-600 border border-slate-200";
		case "DISCONTINUED":
			return "bg-amber-50 text-amber-700 border border-amber-200";
		case "ARCHIVED":
			return "bg-red-50 text-red-700 border border-red-200";
	}
}

function mapProduct(p: Product): ProductRow {
	return {
		id: p.id,
		sku: p.sku,
		name: p.name,
		slug: p.slug,
		status: p.status as ProductStatus,
		categoryId: p.categoryId,
		tags: p.tags,
	};
}

export default function ProductsPage() {
	const navigate = useNavigate();
	const { hasPermission } = useAuth();
	const canCreate = hasPermission("catalog:product:create");
	const canDelete = hasPermission("catalog:product:delete");
	const canPublish = hasPermission("catalog:product:update");

	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [view, setView] = useState<"grid" | "list">("grid");
	const [gridPage, setGridPage] = useState(0);
	const [sheetOpen, setSheetOpen] = useState(false);

	const [tablePagination, setTablePagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});

	const { data, isLoading } = useListProductsQuery({
		page: view === "grid" ? gridPage + 1 : tablePagination.pageIndex + 1,
		limit: view === "grid" ? GRID_PAGE_SIZE : tablePagination.pageSize,
		search: search || undefined,
		status: statusFilter !== "all" ? statusFilter : undefined,
	});

	const publishMutation = usePublishProductMutation();
	const discontinueMutation = useDiscontinueProductMutation();
	const archiveMutation = useArchiveProductMutation();
	const deleteMutation = useDeleteProductMutation();

	const rows = useMemo(() => (data?.data ?? []).map(mapProduct), [data]);

	const totalProducts = data?.total ?? 0;
	const activeProducts = rows.filter((p) => p.status === "ACTIVE").length;

	const handlePublish = useCallback(
		(id: string) => {
			publishMutation.mutate(id, {
				onSuccess: () => toast.success("Product published."),
				onError: () => toast.error("Failed to publish product."),
			});
		},
		[publishMutation],
	);

	const handleDiscontinue = useCallback(
		(id: string) => {
			discontinueMutation.mutate(id, {
				onSuccess: () => toast.success("Product discontinued."),
				onError: () => toast.error("Failed to discontinue product."),
			});
		},
		[discontinueMutation],
	);

	const handleArchive = useCallback(
		(id: string) => {
			archiveMutation.mutate(id, {
				onSuccess: () => toast.success("Product archived."),
				onError: () => toast.error("Failed to archive product."),
			});
		},
		[archiveMutation],
	);

	const handleDelete = useCallback(
		(id: string) => {
			deleteMutation.mutate(id, {
				onSuccess: () => toast.success("Product deleted."),
				onError: () => toast.error("Failed to delete product."),
			});
		},
		[deleteMutation],
	);

	const columns = useMemo<ColumnDef<ProductRow>[]>(
		() => [
			{
				id: "name",
				header: "Product",
				cell: ({ row }) => (
					<div>
						<p className="font-medium text-sm">{row.original.name}</p>
						<span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
							{row.original.sku}
						</span>
					</div>
				),
			},
			{
				id: "tags",
				header: "Tags",
				cell: ({ row }) => (
					<span className="text-xs text-muted-foreground">
						{row.original.tags.slice(0, 3).join(", ")}
					</span>
				),
			},
			{
				id: "status",
				header: "Status",
				cell: ({ row }) => (
					<Badge
						className={cn("text-xs", getStatusBadgeClass(row.original.status))}
					>
						{row.original.status}
					</Badge>
				),
			},
			{
				id: "actions",
				header: "",
				cell: ({ row }) => (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="icon" className="size-8">
								<MoreHorizontal className="size-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem
								onClick={() =>
									navigate({
										to: "/r6/inventory-and-catalog/products/$productId",
										params: { productId: row.original.id },
									})
								}
							>
								View / Edit
							</DropdownMenuItem>
							{canPublish && row.original.status === "DRAFT" && (
								<DropdownMenuItem
									onClick={() => handlePublish(row.original.id)}
								>
									Publish
								</DropdownMenuItem>
							)}
							{canPublish && row.original.status === "ACTIVE" && (
								<DropdownMenuItem
									onClick={() => handleDiscontinue(row.original.id)}
								>
									Discontinue
								</DropdownMenuItem>
							)}
							{canPublish &&
								(row.original.status === "ACTIVE" ||
									row.original.status === "DISCONTINUED") && (
									<DropdownMenuItem
										onClick={() => handleArchive(row.original.id)}
									>
										Archive
									</DropdownMenuItem>
								)}
							{canDelete && (
								<DropdownMenuItem
									className="text-destructive"
									onClick={() => handleDelete(row.original.id)}
								>
									Delete
								</DropdownMenuItem>
							)}
						</DropdownMenuContent>
					</DropdownMenu>
				),
			},
		],
		[
			canDelete,
			canPublish,
			handleDelete,
			handlePublish,
			handleDiscontinue,
			handleArchive,
			navigate,
		],
	);

	const totalGridPages = Math.ceil(totalProducts / GRID_PAGE_SIZE);

	return (
		<div className="flex flex-1 flex-col gap-4 p-4 pt-0 animate-stagger-children">
			<ProductSheet open={sheetOpen} onOpenChange={setSheetOpen} />

			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-xl font-semibold">Products</h1>
					<p className="text-sm text-muted-foreground">
						Manage your product catalog.
					</p>
				</div>
				{canCreate && (
					<Button onClick={() => setSheetOpen(true)}>
						<Plus className="size-4" />
						New Product
					</Button>
				)}
			</div>

			{/* Stats */}
			<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
				{[
					{ label: "Total Products", value: isLoading ? "—" : totalProducts },
					{ label: "Active", value: isLoading ? "—" : activeProducts },
					{ label: "Low Stock", value: "—" },
					{ label: "Out of Stock", value: "—" },
				].map((stat) => (
					<div key={stat.label} className="rounded-xl border bg-card p-4">
						<p className="text-xs text-muted-foreground">{stat.label}</p>
						<p className="text-2xl font-semibold mt-1">{stat.value}</p>
					</div>
				))}
			</div>

			{/* Toolbar */}
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
				<Input
					placeholder="Search products..."
					value={search}
					onChange={(e) => {
						setSearch(e.target.value);
						setGridPage(0);
						setTablePagination((p) => ({ ...p, pageIndex: 0 }));
					}}
					className="sm:max-w-xs"
				/>
				<Select
					value={statusFilter}
					onValueChange={(v) => {
						setStatusFilter(v);
						setGridPage(0);
						setTablePagination((p) => ({ ...p, pageIndex: 0 }));
					}}
				>
					<SelectTrigger className="sm:w-40">
						<SelectValue placeholder="All Statuses" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Statuses</SelectItem>
						<SelectItem value="ACTIVE">Active</SelectItem>
						<SelectItem value="DRAFT">Draft</SelectItem>
						<SelectItem value="DISCONTINUED">Discontinued</SelectItem>
						<SelectItem value="ARCHIVED">Archived</SelectItem>
					</SelectContent>
				</Select>
				<div className="flex items-center gap-1 ml-auto">
					<Button
						variant="outline"
						size="icon"
						className={cn(
							"size-9",
							view === "grid" && "bg-accent text-accent-foreground",
						)}
						onClick={() => setView("grid")}
					>
						<Grid3x3 className="size-4" />
					</Button>
					<Button
						variant="outline"
						size="icon"
						className={cn(
							"size-9",
							view === "list" && "bg-accent text-accent-foreground",
						)}
						onClick={() => setView("list")}
					>
						<List className="size-4" />
					</Button>
				</div>
			</div>

			{/* Grid View */}
			{view === "grid" && (
				<>
					{isLoading ? (
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
							{Array.from(
								{ length: GRID_PAGE_SIZE },
								(_, i) => `skeleton-${i}`,
							).map((key) => (
								<div
									key={key}
									className="bg-card shadow-sm border border-border/50 rounded-xl overflow-hidden animate-shimmer"
								>
									<div className="bg-muted/50 aspect-square" />
									<div className="p-3 flex flex-col gap-2">
										<div className="h-4 bg-muted rounded w-3/4" />
										<div className="h-3 bg-muted rounded w-1/2" />
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
							{rows.map((product) => (
								<div
									key={product.id}
									className="bg-card shadow-sm border border-border/50 rounded-xl overflow-hidden"
								>
									<div className="bg-muted/50 aspect-square flex items-center justify-center">
										<Package className="size-12 text-muted-foreground/30" />
									</div>
									<div className="p-3 flex flex-col gap-2">
										<div className="flex items-start justify-between gap-2">
											<p className="font-medium text-sm leading-tight">
												{product.name}
											</p>
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button
														variant="ghost"
														size="icon"
														className="size-7 shrink-0"
													>
														<MoreHorizontal className="size-3.5" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													<DropdownMenuItem
														onClick={() =>
															navigate({
																to: "/r6/inventory-and-catalog/products/$productId",
																params: { productId: product.id },
															})
														}
													>
														View / Edit
													</DropdownMenuItem>
													{canPublish && product.status === "DRAFT" && (
														<DropdownMenuItem
															onClick={() => handlePublish(product.id)}
														>
															Publish
														</DropdownMenuItem>
													)}
													{canPublish && product.status === "ACTIVE" && (
														<DropdownMenuItem
															onClick={() => handleDiscontinue(product.id)}
														>
															Discontinue
														</DropdownMenuItem>
													)}
													{canPublish &&
														(product.status === "ACTIVE" ||
															product.status === "DISCONTINUED") && (
															<DropdownMenuItem
																onClick={() => handleArchive(product.id)}
															>
																Archive
															</DropdownMenuItem>
														)}
													{canDelete && (
														<DropdownMenuItem
															className="text-destructive"
															onClick={() => handleDelete(product.id)}
														>
															Delete
														</DropdownMenuItem>
													)}
												</DropdownMenuContent>
											</DropdownMenu>
										</div>
										<span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded w-fit text-muted-foreground">
											{product.sku}
										</span>
										<div className="flex items-center justify-between">
											<span className="text-xs text-muted-foreground">
												{product.tags.slice(0, 2).join(", ")}
											</span>
											<Badge
												className={cn(
													"text-xs",
													getStatusBadgeClass(product.status),
												)}
											>
												{product.status}
											</Badge>
										</div>
									</div>
								</div>
							))}
						</div>
					)}

					{/* Grid Pagination */}
					{totalGridPages > 1 && (
						<div className="flex items-center justify-center gap-4">
							<Button
								variant="outline"
								size="sm"
								onClick={() => setGridPage((p) => Math.max(0, p - 1))}
								disabled={gridPage === 0}
							>
								Previous
							</Button>
							<span className="text-sm text-muted-foreground">
								Page {gridPage + 1} of {totalGridPages}
							</span>
							<Button
								variant="outline"
								size="sm"
								onClick={() =>
									setGridPage((p) => Math.min(totalGridPages - 1, p + 1))
								}
								disabled={gridPage >= totalGridPages - 1}
							>
								Next
							</Button>
						</div>
					)}
				</>
			)}

			{/* List View */}
			{view === "list" && (
				<div className="rounded-xl border bg-card">
					<DataTable
						columns={columns}
						data={rows}
						isLoading={isLoading}
						rowCount={data?.total}
						paginationState={tablePagination}
						onPaginationChange={setTablePagination}
					/>
				</div>
			)}
		</div>
	);
}
