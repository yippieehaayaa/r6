import { zodResolver } from "@hookform/resolvers/zod";
import type { ProductSetupInput } from "@r6/schemas";
import { Loader2 } from "lucide-react";
import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

function toSlug(name: string): string {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 63);
}

const ProductFormSchema = z.object({
	productSku: z.string().min(1, "SKU is required").max(100),
	productName: z.string().min(1, "Name is required").max(255),
	productSlug: z
		.string()
		.min(2)
		.max(63)
		.regex(
			/^[a-z0-9][a-z0-9-]*[a-z0-9]$/,
			"Lowercase letters, numbers and hyphens only",
		),
	productDescription: z.string().max(1000).optional().or(z.literal("")),
	categorySlug: z.string().optional().or(z.literal("")),
	brandSlug: z.string().optional().or(z.literal("")),
	// Variant
	variantSku: z.string().min(1, "Variant SKU is required").max(100),
	variantName: z.string().min(1, "Variant name is required").max(255),
	variantBarcode: z.string().max(50).optional().or(z.literal("")),
	trackingType: z.enum(["NONE", "SERIAL", "BATCH"]),
	baseUomAbbreviation: z.string().min(1, "Base UOM is required").max(10),
});

type ProductForm = z.infer<typeof ProductFormSchema>;

interface Props {
	onBack: () => void;
	onNext: (data: ProductSetupInput) => void;
	isSubmitting?: boolean;
	baseUomAbbreviation: string;
	categorySlugs: string[];
	brandSlugs: string[];
}

export function Step6Product({
	onBack,
	onNext,
	isSubmitting,
	baseUomAbbreviation,
	categorySlugs,
	brandSlugs,
}: Props) {
	const {
		register,
		handleSubmit,
		watch,
		setValue,
		formState: { errors },
	} = useForm<ProductForm>({
		resolver: zodResolver(ProductFormSchema),
		defaultValues: {
			trackingType: "NONE",
			baseUomAbbreviation,
			categorySlug: "",
			brandSlug: "",
		},
	});

	const trackingType = watch("trackingType");
	const categorySlug = watch("categorySlug");
	const brandSlug = watch("brandSlug");

	const handleProductNameChange = useCallback(
		(name: string) => {
			setValue("productSlug", toSlug(name), { shouldValidate: true });
			// Mirror to variant name if variant name is empty
			const current = watch("variantName");
			if (!current) setValue("variantName", name);
		},
		[setValue, watch],
	);

	function onSubmit(values: ProductForm) {
		const payload: ProductSetupInput = {
			product: {
				sku: values.productSku,
				name: values.productName,
				slug: values.productSlug,
				description: values.productDescription || undefined,
				categorySlug: values.categorySlug || undefined,
				brandSlug: values.brandSlug || undefined,
			},
			variants: [
				{
					sku: values.variantSku,
					name: values.variantName,
					barcode: values.variantBarcode || undefined,
					options: {},
					trackingType: values.trackingType,
					baseUomAbbreviation: values.baseUomAbbreviation,
				},
			],
		};
		onNext(payload);
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
			<p className="text-sm font-medium">Product</p>

			<FieldGroup>
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<Field>
						<FieldLabel>Product SKU</FieldLabel>
						<Input {...register("productSku")} placeholder="SKU-001" />
						{errors.productSku && (
							<FieldError>{errors.productSku.message}</FieldError>
						)}
					</Field>

					<Field>
						<FieldLabel>Product Name</FieldLabel>
						<Input
							{...register("productName")}
							placeholder="Laptop Stand"
							onChange={(e) => {
								register("productName").onChange(e);
								handleProductNameChange(e.target.value);
							}}
						/>
						{errors.productName && (
							<FieldError>{errors.productName.message}</FieldError>
						)}
					</Field>
				</div>

				<Field>
					<FieldLabel>Slug</FieldLabel>
					<FieldDescription>
						Auto-generated from the product name.
					</FieldDescription>
					<Input {...register("productSlug")} placeholder="laptop-stand" />
					{errors.productSlug && (
						<FieldError>{errors.productSlug.message}</FieldError>
					)}
				</Field>

				<Field>
					<FieldLabel>Description</FieldLabel>
					<Input
						{...register("productDescription")}
						placeholder="Optional product description"
					/>
				</Field>

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<Field>
						<FieldLabel>Category</FieldLabel>
						<Select
							value={categorySlug ?? ""}
							onValueChange={(v) => setValue("categorySlug", v)}
						>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Select category…" />
							</SelectTrigger>
							<SelectContent>
								{categorySlugs.map((slug) => (
									<SelectItem key={slug} value={slug}>
										{slug}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</Field>

					<Field>
						<FieldLabel>Brand</FieldLabel>
						<Select
							value={brandSlug ?? ""}
							onValueChange={(v) => setValue("brandSlug", v)}
						>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Select brand…" />
							</SelectTrigger>
							<SelectContent>
								{brandSlugs.map((slug) => (
									<SelectItem key={slug} value={slug}>
										{slug}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</Field>
				</div>
			</FieldGroup>

			<Separator />

			<p className="text-sm font-medium">Variant</p>

			<FieldGroup>
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<Field>
						<FieldLabel>Variant SKU</FieldLabel>
						<Input {...register("variantSku")} placeholder="SKU-001-V1" />
						{errors.variantSku && (
							<FieldError>{errors.variantSku.message}</FieldError>
						)}
					</Field>

					<Field>
						<FieldLabel>Variant Name</FieldLabel>
						<Input {...register("variantName")} placeholder="Default" />
						{errors.variantName && (
							<FieldError>{errors.variantName.message}</FieldError>
						)}
					</Field>
				</div>

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<Field>
						<FieldLabel>Barcode</FieldLabel>
						<Input
							{...register("variantBarcode")}
							placeholder="Optional EAN / UPC"
						/>
					</Field>

					<Field>
						<FieldLabel>Tracking Type</FieldLabel>
						<Select
							value={trackingType}
							onValueChange={(v) =>
								setValue("trackingType", v as "NONE" | "SERIAL" | "BATCH")
							}
						>
							<SelectTrigger className="w-full">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="NONE">None</SelectItem>
								<SelectItem value="SERIAL">Serial Number</SelectItem>
								<SelectItem value="BATCH">Batch / Lot</SelectItem>
							</SelectContent>
						</Select>
					</Field>
				</div>

				<Field>
					<FieldLabel>Base UOM</FieldLabel>
					<FieldDescription>
						Inherited from Step 2 — the base unit used to track this variant.
					</FieldDescription>
					<Input
						{...register("baseUomAbbreviation")}
						readOnly
						className="bg-muted"
					/>
				</Field>
			</FieldGroup>

			<div className="flex justify-between">
				<Button type="button" variant="outline" onClick={onBack}>
					Back
				</Button>
				<Button type="submit" disabled={isSubmitting}>
					{isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
					{isSubmitting ? "Finishing…" : "Finish Setup"}
				</Button>
			</div>
		</form>
	);
}
