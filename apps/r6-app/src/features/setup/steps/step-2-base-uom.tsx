import { zodResolver } from "@hookform/resolvers/zod";
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

const BaseUomSchema = z.object({
	name: z.string().min(1, "Name is required").max(50),
	abbreviation: z.string().min(1, "Abbreviation is required").max(10),
});

type BaseUomForm = z.infer<typeof BaseUomSchema>;

interface Props {
	defaultValues?: { name?: string; abbreviation?: string };
	onBack: () => void;
	onNext: (baseUom: { name: string; abbreviation: string }) => void;
}

export function Step2BaseUom({ defaultValues, onBack, onNext }: Props) {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<BaseUomForm>({
		resolver: zodResolver(BaseUomSchema),
		defaultValues: {
			name: defaultValues?.name ?? "Piece",
			abbreviation: defaultValues?.abbreviation ?? "pcs",
		},
	});

	function onSubmit(values: BaseUomForm) {
		onNext(values);
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
			<FieldGroup>
				<Field>
					<FieldLabel>Unit Name</FieldLabel>
					<FieldDescription>
						The base unit used for all inventory tracking (e.g. Piece, Unit,
						Item).
					</FieldDescription>
					<Input {...register("name")} placeholder="Piece" />
					{errors.name && <FieldError>{errors.name.message}</FieldError>}
				</Field>

				<Field>
					<FieldLabel>Abbreviation</FieldLabel>
					<FieldDescription>
						Short code used in reports and labels (e.g. pcs, ea, unit).
					</FieldDescription>
					<Input
						{...register("abbreviation")}
						placeholder="pcs"
						maxLength={10}
					/>
					{errors.abbreviation && (
						<FieldError>{errors.abbreviation.message}</FieldError>
					)}
				</Field>
			</FieldGroup>

			<div className="flex justify-between">
				<Button type="button" variant="outline" onClick={onBack}>
					Back
				</Button>
				<Button type="submit">Continue</Button>
			</div>
		</form>
	);
}
