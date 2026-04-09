import { ChevronRight, MoreHorizontal, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { CategorySheet } from "./category-sheet";

export interface CategoryRow {
	id: string;
	name: string;
	slug: string;
	description?: string;
	parentId?: string;
	parentName?: string;
	isActive: boolean;
	sortOrder: number;
	productCount: number;
	createdAt: string;
}

const MOCK_CATEGORIES: CategoryRow[] = [
	{
		id: "cat-electronics",
		name: "Electronics",
		slug: "electronics",
		description: "All consumer electronics and gadgets.",
		isActive: true,
		sortOrder: 1,
		productCount: 45,
		createdAt: "2024-01-01",
	},
	{
		id: "cat-smartphones",
		name: "Smartphones",
		slug: "smartphones",
		description: "Latest smartphones and mobile devices.",
		parentId: "cat-electronics",
		parentName: "Electronics",
		isActive: true,
		sortOrder: 1,
		productCount: 18,
		createdAt: "2024-01-02",
	},
	{
		id: "cat-laptops",
		name: "Laptops",
		slug: "laptops",
		description: "Laptops and portable computers.",
		parentId: "cat-electronics",
		parentName: "Electronics",
		isActive: true,
		sortOrder: 2,
		productCount: 12,
		createdAt: "2024-01-02",
	},
	{
		id: "cat-accessories",
		name: "Accessories",
		slug: "accessories",
		description: "Electronic accessories and peripherals.",
		parentId: "cat-electronics",
		parentName: "Electronics",
		isActive: true,
		sortOrder: 3,
		productCount: 15,
		createdAt: "2024-01-03",
	},
	{
		id: "cat-clothing",
		name: "Clothing",
		slug: "clothing",
		description: "Apparel for men, women, and children.",
		isActive: true,
		sortOrder: 2,
		productCount: 67,
		createdAt: "2024-01-01",
	},
	{
		id: "cat-mens",
		name: "Men's Wear",
		slug: "mens-wear",
		description: "Men's clothing and fashion.",
		parentId: "cat-clothing",
		parentName: "Clothing",
		isActive: true,
		sortOrder: 1,
		productCount: 28,
		createdAt: "2024-01-05",
	},
	{
		id: "cat-womens",
		name: "Women's Wear",
		slug: "womens-wear",
		description: "Women's clothing and fashion.",
		parentId: "cat-clothing",
		parentName: "Clothing",
		isActive: true,
		sortOrder: 2,
		productCount: 39,
		createdAt: "2024-01-05",
	},
	{
		id: "cat-home",
		name: "Home & Living",
		slug: "home-living",
		description: "Home decor, furniture, and lifestyle products.",
		isActive: true,
		sortOrder: 3,
		productCount: 23,
		createdAt: "2024-01-01",
	},
	{
		id: "cat-furniture",
		name: "Furniture",
		slug: "furniture",
		description: "Indoor and outdoor furniture.",
		parentId: "cat-home",
		parentName: "Home & Living",
		isActive: false,
		sortOrder: 1,
		productCount: 10,
		createdAt: "2024-02-01",
	},
	{
		id: "cat-decor",
		name: "Decor",
		slug: "decor",
		description: "Decorative items and accessories.",
		parentId: "cat-home",
		parentName: "Home & Living",
		isActive: true,
		sortOrder: 2,
		productCount: 13,
		createdAt: "2024-02-01",
	},
	{
		id: "cat-sports",
		name: "Sports",
		slug: "sports",
		isActive: true,
		sortOrder: 4,
		productCount: 31,
		createdAt: "2024-01-01",
	},
	{
		id: "cat-toys",
		name: "Toys",
		slug: "toys",
		isActive: true,
		sortOrder: 5,
		productCount: 19,
		createdAt: "2024-01-01",
	},
];

export default function CategoriesPage() {
	const [selectedCategory, setSelectedCategory] = useState<CategoryRow | null>(
		null,
	);
	const [search, setSearch] = useState("");
	const [sheetOpen, setSheetOpen] = useState(false);
	const [editTarget, setEditTarget] = useState<CategoryRow | null>(null);

	const totalCategories = MOCK_CATEGORIES.length;
	const activeCategories = MOCK_CATEGORIES.filter((c) => c.isActive).length;
	const parentCategories = MOCK_CATEGORIES.filter((c) => !c.parentId).length;
	const subCategories = MOCK_CATEGORIES.filter((c) => !!c.parentId).length;

	const filtered = useMemo(() => {
		if (!search) return MOCK_CATEGORIES;
		return MOCK_CATEGORIES.filter((c) =>
			c.name.toLowerCase().includes(search.toLowerCase()),
		);
	}, [search]);

	// Group: parents first, then children indented
	const ordered = useMemo(() => {
		const parents = filtered.filter((c) => !c.parentId);
		const result: CategoryRow[] = [];
		for (const parent of parents) {
			result.push(parent);
			const children = filtered.filter((c) => c.parentId === parent.id);
			result.push(...children);
		}
		// Any children whose parent is filtered out
		const orphans = filtered.filter(
			(c) => c.parentId && !parents.find((p) => p.id === c.parentId),
		);
		result.push(...orphans);
		return result;
	}, [filtered]);

	function openCreate() {
		setEditTarget(null);
		setSheetOpen(true);
	}

	function openEdit(cat: CategoryRow) {
		setEditTarget(cat);
		setSheetOpen(true);
	}

	return (
		<div className="flex flex-1 flex-col gap-4 p-4 pt-0 animate-stagger-children">
			<CategorySheet
				open={sheetOpen}
				onOpenChange={setSheetOpen}
				category={editTarget}
			/>

			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-xl font-semibold">Categories</h1>
					<p className="text-sm text-muted-foreground">
						Organize your product catalog into categories.
					</p>
				</div>
				<Button onClick={openCreate}>
					<Plus className="size-4" />
					New Category
				</Button>
			</div>

			{/* Stats */}
			<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
				{[
					{ label: "Total", value: totalCategories },
					{ label: "Active", value: activeCategories },
					{ label: "Parent Categories", value: parentCategories },
					{ label: "Subcategories", value: subCategories },
				].map((stat) => (
					<div key={stat.label} className="rounded-xl border bg-card p-4">
						<p className="text-xs text-muted-foreground">{stat.label}</p>
						<p className="text-2xl font-semibold mt-1">{stat.value}</p>
					</div>
				))}
			</div>

			{/* Two-panel layout */}
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				{/* Left: Category List */}
				<div className="flex flex-col gap-3">
					<Input
						placeholder="Search categories..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>
					<div className="rounded-xl border bg-card divide-y divide-border/50">
						{ordered.map((cat) => {
							const isChild = !!cat.parentId;
							const isSelected = selectedCategory?.id === cat.id;
							return (
								<button
									type="button"
									key={cat.id}
									className={cn(
										"flex w-full items-center gap-2 px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors text-left",
										isChild && "pl-8",
										isSelected && "bg-accent/50",
									)}
									onClick={() => setSelectedCategory(cat)}
								>
									{isChild && (
										<ChevronRight className="size-3.5 text-muted-foreground shrink-0" />
									)}
									<div className="flex-1 min-w-0">
										<p
											className={cn(
												"text-sm truncate",
												!isChild && "font-semibold",
											)}
										>
											{cat.name}
										</p>
										<p className="text-xs text-muted-foreground">
											{cat.productCount} products
										</p>
									</div>
									<div className="flex items-center gap-2">
										<div
											className={cn(
												"size-2 rounded-full",
												cat.isActive ? "bg-green-500" : "bg-slate-300",
											)}
										/>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													variant="ghost"
													size="icon"
													className="size-7"
													onClick={(e) => e.stopPropagation()}
												>
													<MoreHorizontal className="size-3.5" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuItem onClick={() => openEdit(cat)}>
													Edit
												</DropdownMenuItem>
												<DropdownMenuItem
													onClick={() => {
														setEditTarget(null);
														setSheetOpen(true);
													}}
												>
													Add Subcategory
												</DropdownMenuItem>
												<DropdownMenuItem className="text-destructive">
													Delete
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</div>
								</button>
							);
						})}
					</div>
				</div>

				{/* Right: Category Detail */}
				<div className="lg:col-span-2">
					{!selectedCategory ? (
						<div className="rounded-xl border bg-card h-64 flex flex-col items-center justify-center gap-3 text-center p-6">
							<ChevronRight className="size-8 text-muted-foreground/40" />
							<p className="text-sm font-medium">No category selected</p>
							<p className="text-xs text-muted-foreground">
								Select a category from the list to view its details.
							</p>
						</div>
					) : (
						<Card className="bg-card shadow-sm border border-border/50 rounded-xl">
							<CardHeader>
								<div className="flex items-center justify-between">
									<CardTitle>{selectedCategory.name}</CardTitle>
									<div className="flex items-center gap-2">
										<Badge
											className={cn(
												"text-xs",
												selectedCategory.isActive
													? "bg-green-50 text-green-700 border border-green-200"
													: "bg-slate-100 text-slate-600 border border-slate-200",
											)}
										>
											{selectedCategory.isActive ? "Active" : "Inactive"}
										</Badge>
										<Button
											variant="outline"
											size="sm"
											onClick={() => openEdit(selectedCategory)}
										>
											Edit
										</Button>
									</div>
								</div>
							</CardHeader>
							<CardContent>
								<div className="flex flex-col gap-4">
									{selectedCategory.description && (
										<div>
											<p className="text-xs text-muted-foreground mb-1">
												Description
											</p>
											<p className="text-sm">{selectedCategory.description}</p>
										</div>
									)}
									<div className="grid grid-cols-2 gap-4">
										<div>
											<p className="text-xs text-muted-foreground mb-1">Slug</p>
											<span className="text-xs font-mono bg-muted px-2 py-1 rounded">
												{selectedCategory.slug}
											</span>
										</div>
										<div>
											<p className="text-xs text-muted-foreground mb-1">
												Products
											</p>
											<p className="text-sm font-semibold">
												{selectedCategory.productCount}
											</p>
										</div>
										{selectedCategory.parentName && (
											<div>
												<p className="text-xs text-muted-foreground mb-1">
													Parent Category
												</p>
												<p className="text-sm">{selectedCategory.parentName}</p>
											</div>
										)}
										<div>
											<p className="text-xs text-muted-foreground mb-1">
												Sort Order
											</p>
											<p className="text-sm">{selectedCategory.sortOrder}</p>
										</div>
										<div>
											<p className="text-xs text-muted-foreground mb-1">
												Created
											</p>
											<p className="text-sm">{selectedCategory.createdAt}</p>
										</div>
									</div>
									<div className="flex items-center justify-between pt-2 border-t border-border/50">
										<span className="text-sm font-medium">Active</span>
										<Switch checked={selectedCategory.isActive} />
									</div>

									{/* Subcategories */}
									{MOCK_CATEGORIES.filter(
										(c) => c.parentId === selectedCategory.id,
									).length > 0 && (
										<div>
											<p className="text-xs text-muted-foreground mb-2">
												Subcategories
											</p>
											<div className="flex flex-wrap gap-2">
												{MOCK_CATEGORIES.filter(
													(c) => c.parentId === selectedCategory.id,
												).map((sub) => (
													<Badge
														key={sub.id}
														className="bg-muted text-foreground border border-border/50 cursor-pointer"
														onClick={() => setSelectedCategory(sub)}
													>
														{sub.name} ({sub.productCount})
													</Badge>
												))}
											</div>
										</div>
									)}
								</div>
							</CardContent>
						</Card>
					)}
				</div>
			</div>
		</div>
	);
}
