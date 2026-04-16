import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";

const WarehouseSchema = z.object({
	name: z.string().min(1, "Name is required").max(100),
	code: z.string().min(1, "Code is required").max(20),
	description: z.string().max(500).optional(),
	// Address
	addressLine1: z.string().min(1, "Address is required").max(255),
	addressLine2: z.string().max(255).optional(),
	addressBarangay: z.string().max(100).optional(),
	addressCity: z.string().min(1, "City is required").max(100),
	addressProvince: z.string().max(100).optional(),
	addressState: z.string().min(1, "State / Region is required").max(100),
	addressCountry: z.string().min(2).max(3),
	addressPostal: z.string().min(1, "Postal code is required").max(20),
	landmark: z.string().max(255).optional(),
	// Contact
	contactName: z.string().max(100).optional(),
	contactPhone: z.string().max(30).optional(),
	contactEmail: z
		.string()
		.email("Invalid email")
		.max(254)
		.optional()
		.or(z.literal("")),
});

type WarehouseForm = z.infer<typeof WarehouseSchema>;

interface Props {
	defaultValues?: Partial<WarehouseForm>;
	onBack: () => void;
	onNext: (warehouse: WarehouseForm) => void;
	isSubmitting?: boolean;
}

export function Step3Warehouse({
	defaultValues,
	onBack,
	onNext,
	isSubmitting,
}: Props) {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<WarehouseForm>({
		resolver: zodResolver(WarehouseSchema),
		defaultValues: {
			addressCountry: "PH",
			...defaultValues,
		},
	});

	function onSubmit(data: WarehouseForm) {
		onNext(data);
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
			<FieldGroup>
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<Field>
						<FieldLabel>Warehouse Name</FieldLabel>
						<Input {...register("name")} placeholder="Main Warehouse" />
						{errors.name && <FieldError>{errors.name.message}</FieldError>}
					</Field>

					<Field>
						<FieldLabel>Warehouse Code</FieldLabel>
						<FieldDescription>
							Short unique identifier (e.g. WH-001).
						</FieldDescription>
						<Input {...register("code")} placeholder="WH-001" maxLength={20} />
						{errors.code && <FieldError>{errors.code.message}</FieldError>}
					</Field>
				</div>

				<Field>
					<FieldLabel>Description</FieldLabel>
					<Input
						{...register("description")}
						placeholder="Optional description"
					/>
				</Field>
			</FieldGroup>

			<Separator />

			<p className="text-sm font-medium">Address</p>

			<FieldGroup>
				<Field>
					<FieldLabel>Address Line 1</FieldLabel>
					<Input {...register("addressLine1")} placeholder="123 Main St" />
					{errors.addressLine1 && (
						<FieldError>{errors.addressLine1.message}</FieldError>
					)}
				</Field>

				<Field>
					<FieldLabel>Address Line 2</FieldLabel>
					<Input
						{...register("addressLine2")}
						placeholder="Suite, Floor, Unit (optional)"
					/>
				</Field>

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<Field>
						<FieldLabel>Barangay</FieldLabel>
						<Input
							{...register("addressBarangay")}
							placeholder="Barangay (optional)"
						/>
					</Field>
					<Field>
						<FieldLabel>City / Municipality</FieldLabel>
						<Input {...register("addressCity")} placeholder="Makati" />
						{errors.addressCity && (
							<FieldError>{errors.addressCity.message}</FieldError>
						)}
					</Field>
				</div>

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<Field>
						<FieldLabel>Province</FieldLabel>
						<Input
							{...register("addressProvince")}
							placeholder="Metro Manila (optional)"
						/>
					</Field>
					<Field>
						<FieldLabel>State / Region</FieldLabel>
						<Input {...register("addressState")} placeholder="NCR" />
						{errors.addressState && (
							<FieldError>{errors.addressState.message}</FieldError>
						)}
					</Field>
				</div>

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<Field>
						<FieldLabel>Country</FieldLabel>
						<Input
							{...register("addressCountry")}
							placeholder="PH"
							maxLength={3}
							defaultValue="PH"
						/>
					</Field>
					<Field>
						<FieldLabel>Postal Code</FieldLabel>
						<Input {...register("addressPostal")} placeholder="1200" />
						{errors.addressPostal && (
							<FieldError>{errors.addressPostal.message}</FieldError>
						)}
					</Field>
				</div>

				<Field>
					<FieldLabel>Landmark</FieldLabel>
					<Input
						{...register("landmark")}
						placeholder="Near the mall (optional)"
					/>
				</Field>
			</FieldGroup>

			<Separator />

			<p className="text-sm font-medium">Contact (optional)</p>

			<FieldGroup>
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<Field>
						<FieldLabel>Contact Name</FieldLabel>
						<Input
							{...register("contactName")}
							placeholder="Warehouse Manager"
						/>
					</Field>
					<Field>
						<FieldLabel>Contact Phone</FieldLabel>
						<Input
							{...register("contactPhone")}
							placeholder="+63 912 345 6789"
						/>
					</Field>
				</div>

				<Field>
					<FieldLabel>Contact Email</FieldLabel>
					<Input
						{...register("contactEmail")}
						type="email"
						placeholder="warehouse@example.com"
					/>
					{errors.contactEmail && (
						<FieldError>{errors.contactEmail.message}</FieldError>
					)}
				</Field>
			</FieldGroup>

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
