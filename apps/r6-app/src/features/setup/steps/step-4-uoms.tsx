import { zodResolver } from "@hookform/resolvers/zod";
import type { CatalogSetupInput } from "@r6/schemas";
import { Loader2, Plus, Trash2 } from "lucide-react";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

const UomRowSchema = z.object({
	name: z.string().min(1, "Name is required").max(50),
	abbreviation: z.string().min(1, "Abbreviation is required").max(10),
	uomType: z.enum(["PURCHASE", "SALE"]),
});

const UomsFormSchema = z.object({
	uoms: z.array(UomRowSchema).min(1, "At least one UOM is required"),
});

type UomsForm = z.infer<typeof UomsFormSchema>;

interface Props {
	onBack: () => void;
	onNext: (data: CatalogSetupInput) => void;
	isSubmitting?: boolean;
}

const DEFAULT_UOMS: UomsForm["uoms"] = [
	{ name: "Case", abbreviation: "CASE", uomType: "PURCHASE" },
	{ name: "Box", abbreviation: "BOX", uomType: "SALE" },
];

export function Step4Uoms({ onBack, onNext, isSubmitting }: Props) {
	const {
		register,
		handleSubmit,
		control,
		watch,
		setValue,
		formState: { errors },
	} = useForm<UomsForm>({
		resolver: zodResolver(UomsFormSchema),
		defaultValues: { uoms: DEFAULT_UOMS },
	});

	const { fields, append, remove } = useFieldArray({ control, name: "uoms" });

	function onSubmit(values: UomsForm) {
		onNext({ uoms: values.uoms });
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
			<div className="flex flex-col gap-3">
				{fields.map((field, index) => {
					const typeValue = watch(`uoms.${index}.uomType`);
					return (
						<div
							key={field.id}
							className="grid grid-cols-[1fr_1fr_auto_auto] gap-2 items-start"
						>
							<FieldGroup>
								<Field>
									{index === 0 && <FieldLabel>Unit Name</FieldLabel>}
									<Input
										{...register(`uoms.${index}.name`)}
										placeholder="Case"
									/>
									{errors.uoms?.[index]?.name && (
										<FieldError>{errors.uoms[index]?.name?.message}</FieldError>
									)}
								</Field>
							</FieldGroup>

							<FieldGroup>
								<Field>
									{index === 0 && <FieldLabel>Abbreviation</FieldLabel>}
									<Input
										{...register(`uoms.${index}.abbreviation`)}
										placeholder="CASE"
										maxLength={10}
									/>
									{errors.uoms?.[index]?.abbreviation && (
										<FieldError>
											{errors.uoms[index]?.abbreviation?.message}
										</FieldError>
									)}
								</Field>
							</FieldGroup>

							<FieldGroup>
								<Field>
									{index === 0 && <FieldLabel>Type</FieldLabel>}
									<Select
										value={typeValue}
										onValueChange={(v) =>
											setValue(
												`uoms.${index}.uomType`,
												v as "PURCHASE" | "SALE",
											)
										}
									>
										<SelectTrigger className="w-28">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="PURCHASE">Purchase</SelectItem>
											<SelectItem value="SALE">Sale</SelectItem>
										</SelectContent>
									</Select>
								</Field>
							</FieldGroup>

							<div className={index === 0 ? "mt-5" : ""}>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => remove(index)}
									disabled={fields.length === 1}
									className="h-8 w-8 p-0"
								>
									<Trash2 className="size-3.5" />
									<span className="sr-only">Remove</span>
								</Button>
							</div>
						</div>
					);
				})}
			</div>

			{errors.uoms?.root && (
				<p className="text-sm text-destructive">{errors.uoms.root.message}</p>
			)}

			<Button
				type="button"
				variant="outline"
				size="sm"
				className="self-start"
				onClick={() =>
					append({ name: "", abbreviation: "", uomType: "PURCHASE" })
				}
			>
				<Plus className="mr-1.5 size-3.5" />
				Add UOM
			</Button>

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
