import { zodResolver } from "@hookform/resolvers/zod";
import {
	type Policy,
	permissionRegex,
	type UpdatePolicyInput,
} from "@r6/schemas";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useUpdatePolicyMutation } from "@/api/identity-and-access/policies";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SheetFooter } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { getApiErrorMessage } from "@/lib/api-error";

function linesToArray(text: string): string[] {
	return text
		.split("\n")
		.map((l) => l.trim())
		.filter(Boolean);
}

const EditPolicyFormSchema = z.object({
	name: z
		.string()
		.min(1, "Name is required")
		.max(100, "Name must not exceed 100 characters")
		.trim(),
	description: z
		.string()
		.max(500, "Description must not exceed 500 characters")
		.trim()
		.nullable()
		.optional(),
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
});
type EditPolicyFormValues = z.infer<typeof EditPolicyFormSchema>;

interface Props {
	tenantId: string;
	policy: Policy;
	onSuccess: () => void;
}

export function EditPolicyForm({ tenantId, policy, onSuccess }: Props) {
	const mutation = useUpdatePolicyMutation();

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<EditPolicyFormValues>({
		resolver: zodResolver(EditPolicyFormSchema),
		mode: "onTouched",
		values: {
			name: policy.name,
			description: policy.description,
			permissionsText: policy.permissions.join("\n"),
		},
	});

	function onSubmit(values: EditPolicyFormValues) {
		const body: UpdatePolicyInput = {
			name: values.name,
			description: values.description ?? null,
			permissions: linesToArray(values.permissionsText),
		};
		mutation.mutate(
			{ tenantId, id: policy.id, body },
			{
				onSuccess: () => {
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
						placeholder="What does this policy grant access to?"
						rows={2}
						aria-invalid={!!errors.description}
						{...register("description", {
							setValueAs: (v) => (v === "" ? null : v),
						})}
					/>
					<FieldError errors={errors.description ? [errors.description] : []} />
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
						placeholder={"iam:identity:read\ninventory:stock:read"}
						rows={5}
						className="font-mono text-xs"
						aria-invalid={!!errors.permissionsText}
						{...register("permissionsText")}
					/>
					<FieldError
						errors={errors.permissionsText ? [errors.permissionsText] : []}
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
