import { zodResolver } from "@hookform/resolvers/zod";
import type { CategoryBrandSetupInput } from "@r6/schemas";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useCallback } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

function toSlug(name: string): string {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 63);
}

const CategoryRowSchema = z.object({
	name: z.string().min(1, "Name is required").max(100),
	slug: z
		.string()
		.min(2, "Slug must be at least 2 characters")
		.max(63)
		.regex(
			/^[a-z0-9][a-z0-9-]*[a-z0-9]$/,
			"Lowercase letters, numbers and hyphens only",
		),
	description: z.string().max(500).optional().or(z.literal("")),
});

const BrandRowSchema = z.object({
	name: z.string().min(1, "Name is required").max(100),
	slug: z
		.string()
		.min(2, "Slug must be at least 2 characters")
		.max(63)
		.regex(
			/^[a-z0-9][a-z0-9-]*[a-z0-9]$/,
			"Lowercase letters, numbers and hyphens only",
		),
	description: z.string().max(500).optional().or(z.literal("")),
});

const CatBrandFormSchema = z.object({
	categories: z
		.array(CategoryRowSchema)
		.min(1, "At least one category is required"),
	brands: z.array(BrandRowSchema).min(1, "At least one brand is required"),
});

type CatBrandForm = z.infer<typeof CatBrandFormSchema>;

interface Props {
	onBack: () => void;
	onNext: (data: CategoryBrandSetupInput) => void;
	onCategoriesBrandsCreated?: (data: {
		categories: string[];
		brands: string[];
	}) => void;
	isSubmitting?: boolean;
}

export function Step5CategoriesBrands({
	onBack,
	onNext,
	onCategoriesBrandsCreated,
	isSubmitting,
}: Props) {
	const {
		register,
		handleSubmit,
		control,
		setValue,
		formState: { errors },
	} = useForm<CatBrandForm>({
		resolver: zodResolver(CatBrandFormSchema),
		defaultValues: {
			categories: [{ name: "", slug: "", description: "" }],
			brands: [{ name: "", slug: "", description: "" }],
		},
	});

	const {
		fields: catFields,
		append: appendCat,
		remove: removeCat,
	} = useFieldArray({ control, name: "categories" });

	const {
		fields: brandFields,
		append: appendBrand,
		remove: removeBrand,
	} = useFieldArray({ control, name: "brands" });

	const handleCatNameChange = useCallback(
		(index: number, name: string) => {
			setValue(`categories.${index}.slug`, toSlug(name), {
				shouldValidate: true,
			});
		},
		[setValue],
	);

	const handleBrandNameChange = useCallback(
		(index: number, name: string) => {
			setValue(`brands.${index}.slug`, toSlug(name), {
				shouldValidate: true,
			});
		},
		[setValue],
	);

	function onSubmit(values: CatBrandForm) {
		onCategoriesBrandsCreated?.({
			categories: values.categories.map((c) => c.slug),
			brands: values.brands.map((b) => b.slug),
		});
		onNext({
			categories: values.categories.map((c) => ({
				name: c.name,
				slug: c.slug,
				description: c.description || undefined,
			})),
			brands: values.brands.map((b) => ({
				name: b.name,
				slug: b.slug,
				description: b.description || undefined,
			})),
		});
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
			{/* Categories */}
			<div className="flex flex-col gap-3">
				<p className="text-sm font-medium">Categories</p>
				<p className="text-sm text-muted-foreground">
					Organise products into categories. At least one required.
				</p>

				{catFields.map((field, index) => (
					<div
						key={field.id}
						className="flex flex-col gap-3 rounded-lg border border-border p-3"
					>
						<div className="flex items-start justify-between gap-2">
							<p className="text-sm font-medium text-muted-foreground">
								Category {index + 1}
							</p>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => removeCat(index)}
								disabled={catFields.length === 1}
								className="h-7 w-7 p-0"
							>
								<Trash2 className="size-3" />
								<span className="sr-only">Remove</span>
							</Button>
						</div>

						<FieldGroup>
							<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
								<Field>
									<FieldLabel>Name</FieldLabel>
									<Input
										{...register(`categories.${index}.name`)}
										placeholder="Electronics"
										onChange={(e) => {
											register(`categories.${index}.name`).onChange(e);
											handleCatNameChange(index, e.target.value);
										}}
									/>
									{errors.categories?.[index]?.name && (
										<FieldError>
											{errors.categories[index]?.name?.message}
										</FieldError>
									)}
								</Field>
								<Field>
									<FieldLabel>Slug</FieldLabel>
									<Input
										{...register(`categories.${index}.slug`)}
										placeholder="electronics"
									/>
									{errors.categories?.[index]?.slug && (
										<FieldError>
											{errors.categories[index]?.slug?.message}
										</FieldError>
									)}
								</Field>
							</div>
							<Field>
								<FieldLabel>Description</FieldLabel>
								<Input
									{...register(`categories.${index}.description`)}
									placeholder="Optional description"
								/>
							</Field>
						</FieldGroup>
					</div>
				))}

				{errors.categories?.root && (
					<p className="text-sm text-destructive">
						{errors.categories.root.message}
					</p>
				)}

				<Button
					type="button"
					variant="outline"
					size="sm"
					className="self-start"
					onClick={() => appendCat({ name: "", slug: "", description: "" })}
				>
					<Plus className="mr-1.5 size-3.5" />
					Add Category
				</Button>
			</div>

			<Separator />

			{/* Brands */}
			<div className="flex flex-col gap-3">
				<p className="text-sm font-medium">Brands</p>
				<p className="text-sm text-muted-foreground">
					Associate products with brands. At least one required.
				</p>

				{brandFields.map((field, index) => (
					<div
						key={field.id}
						className="flex flex-col gap-3 rounded-lg border border-border p-3"
					>
						<div className="flex items-start justify-between gap-2">
							<p className="text-sm font-medium text-muted-foreground">
								Brand {index + 1}
							</p>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => removeBrand(index)}
								disabled={brandFields.length === 1}
								className="h-7 w-7 p-0"
							>
								<Trash2 className="size-3" />
								<span className="sr-only">Remove</span>
							</Button>
						</div>

						<FieldGroup>
							<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
								<Field>
									<FieldLabel>Name</FieldLabel>
									<Input
										{...register(`brands.${index}.name`)}
										placeholder="Acme Corp"
										onChange={(e) => {
											register(`brands.${index}.name`).onChange(e);
											handleBrandNameChange(index, e.target.value);
										}}
									/>
									{errors.brands?.[index]?.name && (
										<FieldError>
											{errors.brands[index]?.name?.message}
										</FieldError>
									)}
								</Field>
								<Field>
									<FieldLabel>Slug</FieldLabel>
									<Input
										{...register(`brands.${index}.slug`)}
										placeholder="acme-corp"
									/>
									{errors.brands?.[index]?.slug && (
										<FieldError>
											{errors.brands[index]?.slug?.message}
										</FieldError>
									)}
								</Field>
							</div>
							<Field>
								<FieldLabel>Description</FieldLabel>
								<Input
									{...register(`brands.${index}.description`)}
									placeholder="Optional description"
								/>
							</Field>
						</FieldGroup>
					</div>
				))}

				{errors.brands?.root && (
					<p className="text-sm text-destructive">
						{errors.brands.root.message}
					</p>
				)}

				<Button
					type="button"
					variant="outline"
					size="sm"
					className="self-start"
					onClick={() => appendBrand({ name: "", slug: "", description: "" })}
				>
					<Plus className="mr-1.5 size-3.5" />
					Add Brand
				</Button>
			</div>

			<div className="flex justify-between">
				<Button type="button" variant="outline" onClick={onBack}>
					Back
				</Button>
				<Button type="submit" disabled={isSubmitting}>
					{isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
					{isSubmitting ? "Saving…" : "Continue"}
				</Button>
			</div>
		</form>
	);
}
