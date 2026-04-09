import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";

export const MOCK_CATEGORIES = [
	{ id: "cat-electronics", name: "Electronics" },
	{ id: "cat-clothing", name: "Clothing" },
	{ id: "cat-accessories", name: "Accessories" },
	{ id: "cat-home", name: "Home & Living" },
	{ id: "cat-sports", name: "Sports" },
];

interface ProductSheetProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function ProductSheet({ open, onOpenChange }: ProductSheetProps) {
	const [name, setName] = useState("");
	const [sku, setSku] = useState("");
	const [categoryId, setCategoryId] = useState("");
	const [price, setPrice] = useState("");
	const [initialStock, setInitialStock] = useState("");
	const [status, setStatus] = useState("DRAFT");

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		toast.success("Product created successfully.");
		setName("");
		setSku("");
		setCategoryId("");
		setPrice("");
		setInitialStock("");
		setStatus("DRAFT");
		onOpenChange(false);
	}

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="sm:max-w-md overflow-y-auto animate-stagger-children">
				<SheetHeader>
					<SheetTitle>New Product</SheetTitle>
					<SheetDescription>
						Add a new product to your catalog.
					</SheetDescription>
				</SheetHeader>
				<form onSubmit={handleSubmit} className="flex flex-col gap-4 px-4 py-4">
					<Field>
						<FieldLabel>Name *</FieldLabel>
						<Input
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="Product name"
							required
						/>
					</Field>
					<Field>
						<FieldLabel>SKU *</FieldLabel>
						<Input
							value={sku}
							onChange={(e) => setSku(e.target.value)}
							placeholder="e.g. PROD-001"
							required
						/>
					</Field>
					<Field>
						<FieldLabel>Category</FieldLabel>
						<Select value={categoryId} onValueChange={setCategoryId}>
							<SelectTrigger>
								<SelectValue placeholder="Select category" />
							</SelectTrigger>
							<SelectContent>
								{MOCK_CATEGORIES.map((c) => (
									<SelectItem key={c.id} value={c.id}>
										{c.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</Field>
					<Field>
						<FieldLabel>Price</FieldLabel>
						<Input
							type="number"
							step="0.01"
							value={price}
							onChange={(e) => setPrice(e.target.value)}
							placeholder="0.00"
						/>
					</Field>
					<Field>
						<FieldLabel>Initial Stock</FieldLabel>
						<Input
							type="number"
							value={initialStock}
							onChange={(e) => setInitialStock(e.target.value)}
							placeholder="0"
						/>
					</Field>
					<Field>
						<FieldLabel>Status</FieldLabel>
						<Select value={status} onValueChange={setStatus}>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{["DRAFT", "ACTIVE"].map((s) => (
									<SelectItem key={s} value={s}>
										{s}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</Field>
					<SheetFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
						>
							Cancel
						</Button>
						<Button type="submit">Create Product</Button>
					</SheetFooter>
				</form>
			</SheetContent>
		</Sheet>
	);
}
