import { Link } from "@tanstack/react-router";
import { ChevronLeft, Package, Plus } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type ProductStatus = "DRAFT" | "ACTIVE" | "DISCONTINUED" | "ARCHIVED";

interface ProductRow {
	id: string;
	sku: string;
	name: string;
	description: string;
	status: ProductStatus;
	categoryId: string;
	price: number;
	compareAtPrice: number;
	cost: number;
	stockOnHand: number;
	tags: string[];
}

interface VariantRow {
	id: string;
	size: string;
	color: string;
	sku: string;
	price: number;
	stock: number;
}

const MOCK_PRODUCTS: ProductRow[] = [
	{
		id: "prod-001",
		sku: "ELEC-001",
		name: "Wireless Bluetooth Headphones",
		description: "Premium over-ear headphones with active noise cancellation.",
		status: "ACTIVE",
		categoryId: "cat-electronics",
		price: 149.99,
		compareAtPrice: 199.99,
		cost: 75.0,
		stockOnHand: 42,
		tags: ["bluetooth", "audio", "noise-cancelling"],
	},
	{
		id: "prod-002",
		sku: "ELEC-002",
		name: "Smart Watch Series 5",
		description: "Feature-packed smartwatch with health monitoring and GPS.",
		status: "ACTIVE",
		categoryId: "cat-electronics",
		price: 299.99,
		compareAtPrice: 349.99,
		cost: 150.0,
		stockOnHand: 18,
		tags: ["wearable", "fitness", "gps"],
	},
	{
		id: "prod-003",
		sku: "ELEC-003",
		name: '4K Ultra HD Monitor 27"',
		description: "Professional 27-inch 4K display with HDR support.",
		status: "ACTIVE",
		categoryId: "cat-electronics",
		price: 499.99,
		compareAtPrice: 599.99,
		cost: 280.0,
		stockOnHand: 9,
		tags: ["monitor", "4k", "professional"],
	},
	{
		id: "prod-004",
		sku: "ELEC-004",
		name: "Mechanical Gaming Keyboard",
		description: "RGB mechanical keyboard with Cherry MX switches.",
		status: "ACTIVE",
		categoryId: "cat-electronics",
		price: 129.99,
		compareAtPrice: 149.99,
		cost: 60.0,
		stockOnHand: 3,
		tags: ["gaming", "keyboard", "rgb"],
	},
	{
		id: "prod-005",
		sku: "CLTH-001",
		name: "Men's Classic Oxford Shirt",
		description: "Timeless Oxford button-down shirt in premium cotton.",
		status: "ACTIVE",
		categoryId: "cat-clothing",
		price: 59.99,
		compareAtPrice: 79.99,
		cost: 22.0,
		stockOnHand: 75,
		tags: ["men", "shirt", "formal"],
	},
	{
		id: "prod-009",
		sku: "HOME-001",
		name: "Bamboo Desk Organizer",
		description: "Eco-friendly bamboo organizer with multiple compartments.",
		status: "DRAFT",
		categoryId: "cat-home",
		price: 24.99,
		compareAtPrice: 0,
		cost: 10.0,
		stockOnHand: 30,
		tags: ["bamboo", "eco", "desk"],
	},
	{
		id: "prod-011",
		sku: "SPRT-001",
		name: "Adjustable Dumbbell Set",
		description: "Compact adjustable dumbbells ranging from 5 to 52.5 lbs.",
		status: "DRAFT",
		categoryId: "cat-sports",
		price: 349.99,
		compareAtPrice: 399.99,
		cost: 180.0,
		stockOnHand: 15,
		tags: ["fitness", "weights", "home-gym"],
	},
];

const MOCK_VARIANTS: VariantRow[] = [
	{
		id: "var-001",
		size: "Small",
		color: "Red",
		sku: "PROD-001-SM-RD",
		price: 149.99,
		stock: 15,
	},
	{
		id: "var-002",
		size: "Medium",
		color: "Blue",
		sku: "PROD-001-MD-BL",
		price: 149.99,
		stock: 20,
	},
	{
		id: "var-003",
		size: "Large",
		color: "Black",
		sku: "PROD-001-LG-BK",
		price: 149.99,
		stock: 7,
	},
];

const CATEGORIES = [
	{ id: "cat-electronics", name: "Electronics" },
	{ id: "cat-clothing", name: "Clothing" },
	{ id: "cat-accessories", name: "Accessories" },
	{ id: "cat-home", name: "Home & Living" },
	{ id: "cat-sports", name: "Sports" },
];

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

interface ProductDetailPageProps {
	productId: string;
}

export default function ProductDetailPage({
	productId,
}: ProductDetailPageProps) {
	const product = MOCK_PRODUCTS.find((p) => p.id === productId);

	const [name, setName] = useState(product?.name ?? "");
	const [description, setDescription] = useState(product?.description ?? "");
	const [status, setStatus] = useState<ProductStatus>(
		product?.status ?? "DRAFT",
	);
	const [price, setPrice] = useState(String(product?.price ?? ""));
	const [compareAtPrice, setCompareAtPrice] = useState(
		String(product?.compareAtPrice ?? ""),
	);
	const [cost, setCost] = useState(String(product?.cost ?? ""));
	const [sku, setSku] = useState(product?.sku ?? "");
	const [stock, setStock] = useState(String(product?.stockOnHand ?? ""));
	const [trackInventory, setTrackInventory] = useState(true);
	const [published, setPublished] = useState(product?.status === "ACTIVE");
	const [categoryId, setCategoryId] = useState(product?.categoryId ?? "");
	const [tags, setTags] = useState(product?.tags.join(", ") ?? "");

	if (!product) {
		return (
			<div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
				<Package className="size-16 text-muted-foreground/30" />
				<h2 className="text-xl font-semibold">Product Not Found</h2>
				<p className="text-sm text-muted-foreground">
					The product you are looking for does not exist or has been removed.
				</p>
				<Link to="/r6/inventory-and-catalog/products">
					<Button variant="outline">Back to Products</Button>
				</Link>
			</div>
		);
	}

	return (
		<div className="flex flex-1 flex-col gap-6 p-4 pt-0 animate-stagger-children pb-24 md:pb-4">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Link
						to="/r6/inventory-and-catalog/products"
						className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
					>
						<ChevronLeft className="size-4" />
						Products
					</Link>
					<span className="text-muted-foreground">/</span>
					<div className="flex items-center gap-2">
						<h1 className="text-lg font-semibold">{name || product.name}</h1>
						<Badge className={cn("text-xs", getStatusBadgeClass(status))}>
							{status}
						</Badge>
					</div>
				</div>
				<div className="hidden md:flex gap-2">
					<Button variant="outline">Save Draft</Button>
					<Button>Publish</Button>
				</div>
			</div>

			{/* Two columns */}
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				{/* Main col (2/3) */}
				<div className="lg:col-span-2 flex flex-col gap-6">
					{/* Image gallery */}
					<Card className="bg-card shadow-sm border border-border/50 rounded-xl">
						<CardContent className="pt-6">
							<div className="bg-muted/50 rounded-xl aspect-video flex items-center justify-center mb-3">
								<Package className="size-16 text-muted-foreground/30" />
							</div>
							<div className="flex gap-2">
								{[1, 2, 3, 4].map((i) => (
									<div
										key={i}
										className="size-16 bg-muted/50 rounded-lg flex items-center justify-center"
									>
										<Package className="size-6 text-muted-foreground/30" />
									</div>
								))}
							</div>
						</CardContent>
					</Card>

					{/* General Information */}
					<Card className="bg-card shadow-sm border border-border/50 rounded-xl">
						<CardHeader>
							<CardTitle>General Information</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="flex flex-col gap-4">
								<Field>
									<FieldLabel>Name</FieldLabel>
									<Input
										value={name}
										onChange={(e) => setName(e.target.value)}
									/>
								</Field>
								<Field>
									<FieldLabel>Description</FieldLabel>
									<Textarea
										value={description}
										onChange={(e) => setDescription(e.target.value)}
										rows={4}
									/>
								</Field>
								<Field>
									<FieldLabel>Status</FieldLabel>
									<Select
										value={status}
										onValueChange={(v) => setStatus(v as ProductStatus)}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{(
												[
													"DRAFT",
													"ACTIVE",
													"DISCONTINUED",
													"ARCHIVED",
												] as ProductStatus[]
											).map((s) => (
												<SelectItem key={s} value={s}>
													{s}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</Field>
							</div>
						</CardContent>
					</Card>

					{/* Pricing */}
					<Card className="bg-card shadow-sm border border-border/50 rounded-xl">
						<CardHeader>
							<CardTitle>Pricing</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
								<Field>
									<FieldLabel>Price</FieldLabel>
									<Input
										type="number"
										step="0.01"
										value={price}
										onChange={(e) => setPrice(e.target.value)}
									/>
								</Field>
								<Field>
									<FieldLabel>Compare-at Price</FieldLabel>
									<Input
										type="number"
										step="0.01"
										value={compareAtPrice}
										onChange={(e) => setCompareAtPrice(e.target.value)}
									/>
								</Field>
								<Field>
									<FieldLabel>Cost</FieldLabel>
									<Input
										type="number"
										step="0.01"
										value={cost}
										onChange={(e) => setCost(e.target.value)}
									/>
								</Field>
							</div>
						</CardContent>
					</Card>

					{/* Variants */}
					<Card className="bg-card shadow-sm border border-border/50 rounded-xl">
						<CardHeader>
							<div className="flex items-center justify-between">
								<CardTitle>Variants</CardTitle>
								<Button variant="outline" size="sm">
									<Plus className="size-4" />
									Add Variant
								</Button>
							</div>
						</CardHeader>
						<CardContent>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Size</TableHead>
										<TableHead>Color</TableHead>
										<TableHead>SKU</TableHead>
										<TableHead>Price</TableHead>
										<TableHead>Stock</TableHead>
										<TableHead />
									</TableRow>
								</TableHeader>
								<TableBody>
									{MOCK_VARIANTS.map((variant) => (
										<TableRow key={variant.id}>
											<TableCell>{variant.size}</TableCell>
											<TableCell>{variant.color}</TableCell>
											<TableCell>
												<span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
													{variant.sku}
												</span>
											</TableCell>
											<TableCell>${variant.price.toFixed(2)}</TableCell>
											<TableCell>
												<span
													className={cn(
														"font-medium",
														variant.stock === 0 && "text-red-600",
														variant.stock > 0 &&
															variant.stock <= 5 &&
															"text-amber-600",
													)}
												>
													{variant.stock}
												</span>
											</TableCell>
											<TableCell>
												<Button variant="ghost" size="sm" className="text-xs">
													Edit
												</Button>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</CardContent>
					</Card>
				</div>

				{/* Sidebar (1/3) */}
				<div className="flex flex-col gap-6">
					{/* Organization */}
					<Card className="bg-card shadow-sm border border-border/50 rounded-xl">
						<CardHeader>
							<CardTitle>Organization</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="flex flex-col gap-4">
								<Field>
									<FieldLabel>Category</FieldLabel>
									<Select value={categoryId} onValueChange={setCategoryId}>
										<SelectTrigger>
											<SelectValue placeholder="Select category" />
										</SelectTrigger>
										<SelectContent>
											{CATEGORIES.map((c) => (
												<SelectItem key={c.id} value={c.id}>
													{c.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</Field>
								<Field>
									<FieldLabel>Tags</FieldLabel>
									<Input
										value={tags}
										onChange={(e) => setTags(e.target.value)}
										placeholder="bluetooth, audio, wireless..."
									/>
								</Field>
							</div>
						</CardContent>
					</Card>

					{/* Inventory */}
					<Card className="bg-card shadow-sm border border-border/50 rounded-xl">
						<CardHeader>
							<CardTitle>Inventory</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="flex flex-col gap-4">
								<Field>
									<FieldLabel>SKU</FieldLabel>
									<Input value={sku} onChange={(e) => setSku(e.target.value)} />
								</Field>
								<Field>
									<FieldLabel>Barcode</FieldLabel>
									<Input placeholder="ISBN, UPC, GTIN, etc." />
								</Field>
								<Field>
									<FieldLabel>Stock Quantity</FieldLabel>
									<Input
										type="number"
										value={stock}
										onChange={(e) => setStock(e.target.value)}
									/>
								</Field>
								<div className="flex items-center justify-between">
									<Label className="text-sm">Track Inventory</Label>
									<Switch
										checked={trackInventory}
										onCheckedChange={setTrackInventory}
									/>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Visibility */}
					<Card className="bg-card shadow-sm border border-border/50 rounded-xl">
						<CardHeader>
							<CardTitle>Visibility</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="flex flex-col gap-4">
								<div className="flex items-center justify-between">
									<Label className="text-sm">Published</Label>
									<Switch checked={published} onCheckedChange={setPublished} />
								</div>
								<Field>
									<FieldLabel>Schedule Date</FieldLabel>
									<Input type="date" />
								</Field>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Mobile sticky bottom bar */}
			<div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t p-4 flex gap-2 z-10">
				<Button variant="outline" className="flex-1">
					Save Draft
				</Button>
				<Button className="flex-1">Publish</Button>
			</div>
		</div>
	);
}
