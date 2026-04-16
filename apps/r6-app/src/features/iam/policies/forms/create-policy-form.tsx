import { zodResolver } from "@hookform/resolvers/zod";
import {
	type CreatePolicyInput,
	PolicySchema,
	permissionRegex,
	serviceNameRegex,
} from "@r6/schemas";
import { useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useCreatePolicyMutation } from "@/api/identity-and-access/policies";
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
import { SheetFooter } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { getApiErrorMessage } from "@/lib/api-error";

function linesToArray(text: string): string[] {
	return text
		.split("\n")
		.map((l) => l.trim())
		.filter(Boolean);
}

// Form schema: permissions and audience are edited as newline-separated text,
// then transformed into arrays in onSubmit.
const CreatePolicyFormSchema = PolicySchema.omit({
	permissions: true,
	audience: true,
}).extend({
	permissionsText: z
		.string()
		.min(1, "At least one permission must be listed")
		.superRefine((val, ctx) => {
			const invalid = val
				.split("\n")
				.map((l) => l.trim())
				.filter(Boolean)
				.filter((l) => !permissionRegex.test(l));
			if (invalid.length > 0) {
				ctx.addIssue({
					code: "custom",
					message: `Invalid: ${invalid.map((l) => `"${l}"`).join(", ")} — must follow service:resource:action format (wildcards * allowed)`,
				});
			}
		}),
	audienceText: z
		.string()
		.min(1, "At least one audience service must be listed")
		.superRefine((val, ctx) => {
			const invalid = val
				.split("\n")
				.map((l) => l.trim())
				.filter(Boolean)
				.filter((l) => !serviceNameRegex.test(l));
			if (invalid.length > 0) {
				ctx.addIssue({
					code: "custom",
					message: `Invalid: ${invalid.map((l) => `"${l}"`).join(", ")} — must be a lowercase slug (e.g. inventory)`,
				});
			}
		}),
});
type CreatePolicyFormValues = z.infer<typeof CreatePolicyFormSchema>;

interface Props {
	onSuccess: () => void;
}

export function CreatePolicyForm({ onSuccess }: Props) {
	const queryClient = useQueryClient();
	const mutation = useCreatePolicyMutation();

	const {
		register,
		handleSubmit,
		control,
		formState: { errors, isSubmitting },
	} = useForm<CreatePolicyFormValues>({
		resolver: zodResolver(CreatePolicyFormSchema),
		mode: "onTouched",
		defaultValues: {
			name: "",
			description: null,
			effect: "ALLOW",
			conditions: null,
			tenantId: null,
			permissionsText: "",
			audienceText: "",
		},
	});

	function onSubmit(values: CreatePolicyFormValues) {
		const { permissionsText, audienceText, ...rest } = values;
		const body: CreatePolicyInput = {
			...rest,
			permissions: linesToArray(permissionsText),
			audience: linesToArray(audienceText),
		};
		mutation.mutate(
			{ body },
			{
				onSuccess: () => {
					queryClient.invalidateQueries({ queryKey: ["policies"] });
					toast.success("Policy created.");
					onSuccess();
				},
				onError: (err) => toast.error(getApiErrorMessage(err)),
			},
		);
	}

	return (
		<form
			id="create-policy-form"
			onSubmit={handleSubmit(onSubmit)}
			className="flex flex-col gap-4 px-4"
		>
			<FieldGroup>
				<Field data-invalid={!!errors.name}>
					<FieldLabel htmlFor="name">Name</FieldLabel>
					<Input
						id="name"
						placeholder="inventory-full-access"
						aria-invalid={!!errors.name}
						{...register("name")}
					/>
					<FieldError errors={errors.name ? [errors.name] : []} />
				</Field>

				<Field data-invalid={!!errors.description}>
					<FieldLabel htmlFor="description">Description (optional)</FieldLabel>
					<Textarea
						id="description"
						placeholder="What does this policy allow or deny?"
						rows={2}
						aria-invalid={!!errors.description}
						{...register("description", {
							setValueAs: (v) => (v === "" ? null : v),
						})}
					/>
					<FieldError errors={errors.description ? [errors.description] : []} />
				</Field>

				<Field data-invalid={!!errors.effect}>
					<FieldLabel htmlFor="effect">Effect</FieldLabel>
					<Controller
						name="effect"
						control={control}
						render={({ field }) => (
							<Select value={field.value} onValueChange={field.onChange}>
								<SelectTrigger
									id="effect"
									className="w-full"
									aria-invalid={!!errors.effect}
								>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="ALLOW">ALLOW</SelectItem>
									<SelectItem value="DENY">DENY</SelectItem>
								</SelectContent>
							</Select>
						)}
					/>
					<FieldError errors={errors.effect ? [errors.effect] : []} />
				</Field>

				<Field data-invalid={!!errors.permissionsText}>
					<FieldLabel htmlFor="permissionsText">
						Permissions{" "}
						<span className="text-muted-foreground font-normal">
							(one per line)
						</span>
					</FieldLabel>
					<Textarea
						id="permissionsText"
						placeholder={"inventory:stock:read\ninventory:stock:write"}
						rows={4}
						className="font-mono"
						aria-invalid={!!errors.permissionsText}
						{...register("permissionsText")}
					/>
					<FieldError
						errors={errors.permissionsText ? [errors.permissionsText] : []}
					/>
				</Field>

				<Field data-invalid={!!errors.audienceText}>
					<FieldLabel htmlFor="audienceText">
						Audience{" "}
						<span className="text-muted-foreground font-normal">
							(one per line)
						</span>
					</FieldLabel>
					<Textarea
						id="audienceText"
						placeholder={"inventory\nprocurement"}
						rows={3}
						className="font-mono"
						aria-invalid={!!errors.audienceText}
						{...register("audienceText")}
					/>
					<FieldError
						errors={errors.audienceText ? [errors.audienceText] : []}
					/>
				</Field>
			</FieldGroup>

			<SheetFooter>
				<Button type="submit" form="create-policy-form" disabled={isSubmitting}>
					{isSubmitting ? "Creating…" : "Create"}
				</Button>
			</SheetFooter>
		</form>
	);
}
