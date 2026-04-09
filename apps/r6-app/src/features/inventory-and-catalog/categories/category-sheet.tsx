import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
	useCreateCategoryMutation,
	useUpdateCategoryMutation,
} from "@/api/inventory-and-catalog";
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
import { Textarea } from "@/components/ui/textarea";
import type { CategoryRow } from "./page";

interface CategorySheetProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	category?: CategoryRow | null;
	categories: CategoryRow[];
}

export function CategorySheet({
	open,
	onOpenChange,
	category,
	categories,
}: CategorySheetProps) {
	const isEdit = !!category;

	const [name, setName] = useState("");
	const [parentId, setParentId] = useState("none");
	const [description, setDescription] = useState("");

	const createMutation = useCreateCategoryMutation();
	const updateMutation = useUpdateCategoryMutation();
	const isPending = createMutation.isPending || updateMutation.isPending;

	useEffect(() => {
		if (open) {
			setName(category?.name ?? "");
			setParentId(category?.parentId ?? "none");
			setDescription(category?.description ?? "");
		}
	}, [open, category]);

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		const body = {
			name,
			description: description || undefined,
			parentId: parentId === "none" ? undefined : parentId,
		};
		if (isEdit && category) {
			updateMutation.mutate(
				{ id: category.id, body },
				{
					onSuccess: () => {
						toast.success("Category updated.");
						onOpenChange(false);
					},
					onError: () => toast.error("Failed to update category."),
				},
			);
		} else {
			createMutation.mutate(
				{ ...body, sortOrder: 0, isActive: true },
				{
					onSuccess: () => {
						toast.success("Category created.");
						onOpenChange(false);
					},
					onError: () => toast.error("Failed to create category."),
				},
			);
		}
	}

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="sm:max-w-md overflow-y-auto animate-stagger-children">
				<SheetHeader>
					<SheetTitle>{isEdit ? "Edit Category" : "New Category"}</SheetTitle>
					<SheetDescription>
						{isEdit
							? "Update category details."
							: "Add a new category to your catalog."}
					</SheetDescription>
				</SheetHeader>
				<form onSubmit={handleSubmit} className="flex flex-col gap-4 px-4 py-4">
					<Field>
						<FieldLabel>Name *</FieldLabel>
						<Input
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="Category name"
							required
						/>
					</Field>
					<Field>
						<FieldLabel>Parent Category</FieldLabel>
						<Select value={parentId} onValueChange={setParentId}>
							<SelectTrigger>
								<SelectValue placeholder="None (top-level)" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="none">None (top-level)</SelectItem>
								{categories
									.filter(
										(c) => !c.parentId && (!category || c.id !== category.id),
									)
									.map((c) => (
										<SelectItem key={c.id} value={c.id}>
											{c.name}
										</SelectItem>
									))}
							</SelectContent>
						</Select>
					</Field>
					<Field>
						<FieldLabel>Description</FieldLabel>
						<Textarea
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="Optional description..."
							rows={3}
						/>
					</Field>
					<SheetFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isPending}>
							{isPending
								? "Saving..."
								: isEdit
									? "Save Changes"
									: "Create Category"}
						</Button>
					</SheetFooter>
				</form>
			</SheetContent>
		</Sheet>
	);
}
