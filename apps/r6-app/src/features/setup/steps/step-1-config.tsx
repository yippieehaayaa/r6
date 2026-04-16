import { zodResolver } from "@hookform/resolvers/zod";
import type { OnboardTenantInput } from "@r6/schemas";
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

const ConfigSchema = z.object({
	costingMethod: z.enum(["FIFO", "AVCO", "FEFO"]).optional(),
	defaultCurrency: z.string().max(3).optional().or(z.literal("")),
	lotExpiryAlertDays: z
		.string()
		.optional()
		.refine(
			(v) => !v || (/^\d+$/.test(v) && Number(v) >= 1),
			"Must be a whole number ≥ 1",
		),
	cartReservationTtlMinutes: z
		.string()
		.optional()
		.refine(
			(v) => !v || (/^\d+$/.test(v) && Number(v) >= 1),
			"Must be a whole number ≥ 1",
		),
	countVarianceThresholdPct: z
		.string()
		.optional()
		.refine(
			(v) =>
				!v || (!Number.isNaN(Number(v)) && Number(v) >= 0 && Number(v) <= 100),
			"Must be 0–100",
		),
});

type ConfigForm = z.infer<typeof ConfigSchema>;

interface Props {
	defaultValues?: OnboardTenantInput["config"];
	onNext: (config: OnboardTenantInput["config"]) => void;
}

const COSTING_LABELS: Record<string, string> = {
	FIFO: "FIFO — First In, First Out",
	AVCO: "AVCO — Average Cost",
	FEFO: "FEFO — First Expired, First Out",
};

export function Step1Config({ defaultValues, onNext }: Props) {
	const {
		register,
		handleSubmit,
		watch,
		setValue,
		formState: { errors },
	} = useForm<ConfigForm>({
		resolver: zodResolver(ConfigSchema),
		defaultValues: {
			costingMethod: defaultValues?.costingMethod,
			defaultCurrency: defaultValues?.defaultCurrency ?? "",
			lotExpiryAlertDays: defaultValues?.lotExpiryAlertDays?.toString() ?? "",
			cartReservationTtlMinutes:
				defaultValues?.cartReservationTtlMinutes?.toString() ?? "",
			countVarianceThresholdPct:
				defaultValues?.countVarianceThresholdPct?.toString() ?? "",
		},
	});

	const costingMethod = watch("costingMethod");

	function onSubmit(values: ConfigForm) {
		const config: OnboardTenantInput["config"] = {};
		if (values.costingMethod) config.costingMethod = values.costingMethod;
		if (values.defaultCurrency && values.defaultCurrency.length === 3) {
			config.defaultCurrency = values.defaultCurrency.toUpperCase();
		}
		if (values.lotExpiryAlertDays)
			config.lotExpiryAlertDays = parseInt(values.lotExpiryAlertDays, 10);
		if (values.cartReservationTtlMinutes)
			config.cartReservationTtlMinutes = parseInt(
				values.cartReservationTtlMinutes,
				10,
			);
		if (values.countVarianceThresholdPct)
			config.countVarianceThresholdPct = parseFloat(
				values.countVarianceThresholdPct,
			);
		onNext(Object.keys(config).length > 0 ? config : undefined);
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
			<FieldGroup>
				<Field>
					<FieldLabel>Costing Method</FieldLabel>
					<FieldDescription>
						How inventory cost is calculated for sold items.
					</FieldDescription>
					<Select
						value={costingMethod ?? ""}
						onValueChange={(v) =>
							setValue("costingMethod", v as "FIFO" | "AVCO" | "FEFO")
						}
					>
						<SelectTrigger className="w-full">
							<SelectValue placeholder="Select method…" />
						</SelectTrigger>
						<SelectContent>
							{Object.entries(COSTING_LABELS).map(([value, label]) => (
								<SelectItem key={value} value={value}>
									{label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					{errors.costingMethod && (
						<FieldError>{errors.costingMethod.message}</FieldError>
					)}
				</Field>

				<Field>
					<FieldLabel>Default Currency</FieldLabel>
					<FieldDescription>
						ISO 4217 code (e.g. PHP, USD, EUR).
					</FieldDescription>
					<Input
						{...register("defaultCurrency")}
						placeholder="PHP"
						maxLength={3}
						className="uppercase"
					/>
					{errors.defaultCurrency && (
						<FieldError>{errors.defaultCurrency.message}</FieldError>
					)}
				</Field>

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<Field>
						<FieldLabel>Lot Expiry Alert Days</FieldLabel>
						<FieldDescription>
							Days before expiry to trigger alert.
						</FieldDescription>
						<Input
							{...register("lotExpiryAlertDays")}
							type="number"
							min={1}
							placeholder="30"
						/>
						{errors.lotExpiryAlertDays && (
							<FieldError>{errors.lotExpiryAlertDays.message}</FieldError>
						)}
					</Field>

					<Field>
						<FieldLabel>Cart Reservation TTL (min)</FieldLabel>
						<FieldDescription>
							Minutes before a cart reservation expires.
						</FieldDescription>
						<Input
							{...register("cartReservationTtlMinutes")}
							type="number"
							min={1}
							placeholder="30"
						/>
						{errors.cartReservationTtlMinutes && (
							<FieldError>
								{errors.cartReservationTtlMinutes.message}
							</FieldError>
						)}
					</Field>
				</div>

				<Field>
					<FieldLabel>Count Variance Threshold (%)</FieldLabel>
					<FieldDescription>
						Max allowed discrepancy between counted and expected stock.
					</FieldDescription>
					<Input
						{...register("countVarianceThresholdPct")}
						type="number"
						min={0}
						max={100}
						step="0.01"
						placeholder="5"
					/>
					{errors.countVarianceThresholdPct && (
						<FieldError>{errors.countVarianceThresholdPct.message}</FieldError>
					)}
				</Field>
			</FieldGroup>

			<div className="flex justify-end">
				<Button type="submit">Continue</Button>
			</div>
		</form>
	);
}
