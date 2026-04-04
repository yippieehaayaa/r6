import { zodResolver } from "@hookform/resolvers/zod";
import {
	type Policy,
	PolicySchema,
	permissionRegex,
	serviceNameRegex,
	type UpdatePolicyInput,
} from "@r6/schemas";
import { useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useUpdatePolicyMutation } from "@/api/policies";
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

const EditPolicyFormSchema = PolicySchema.omit({
	id: true,
	tenantId: true,
	createdAt: true,
	updatedAt: true,
	deletedAt: true,
	permissions: true,
	audience: true,
})
	.partial()
	.extend({
		permissionsText: z
			.string()
			.optional()
			.superRefine((val, ctx) => {
				if (!val) return;
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
			.optional()
			.superRefine((val, ctx) => {
				if (!val) return;
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
type EditPolicyFormValues = z.infer<typeof EditPolicyFormSchema>;

interface Props {
	policy: Policy;
	onSuccess: () => void;
}

export function EditPolicyForm({ policy, onSuccess }: Props) {
	const queryClient = useQueryClient();
	const mutation = useUpdatePolicyMutation();

	const {
		register,
		handleSubmit,
		control,
		formState: { errors, isSubmitting },
	} = useForm<EditPolicyFormValues>({
		resolver: zodResolver(EditPolicyFormSchema),
		mode: "onTouched",
		values: {
			name: policy.name,
			description: policy.description,
			effect: policy.effect,
			conditions: policy.conditions,
			permissionsText: policy.permissions.join("\n"),
			audienceText: policy.audience.join("\n"),
		},
	});

	function onSubmit(values: EditPolicyFormValues) {
		const { permissionsText, audienceText, ...rest } = values;
		const body: UpdatePolicyInput = {
			...rest,
			...(permissionsText !== undefined && {
				permissions: linesToArray(permissionsText),
			}),
			...(audienceText !== undefined && {
				audience: linesToArray(audienceText),
			}),
		};
		mutation.mutate(
			{ id: policy.id, body },
			{
				onSuccess: () => {
					queryClient.invalidateQueries({ queryKey: ["policies"] });
					toast.success("Policy updated.");
					onSuccess();
				},
				onError: (err) => toast.error(getApiErrorMessage(err)),
			},
		);
	}

	return (
		<form
			id="edit-policy-form"
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
				<Button type="submit" form="edit-policy-form" disabled={isSubmitting}>
					{isSubmitting ? "Saving…" : "Save changes"}
				</Button>
			</SheetFooter>
		</form>
	);
}
