import { zodResolver } from "@hookform/resolvers/zod";
import {
	type Tenant,
	type UpdateTenantInput,
	UpdateTenantSchema,
} from "@r6/schemas";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useUpdateTenantMutation } from "@/api/tenants";
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

// Form schema: moduleAccess is edited as newline-separated text
const EditTenantFormSchema = UpdateTenantSchema.omit({
	moduleAccess: true,
}).extend({
	moduleAccessText: z.string().optional(),
});
type EditTenantFormValues = z.infer<typeof EditTenantFormSchema>;

interface Props {
	tenant: Tenant;
	onSuccess: () => void;
}

export function EditTenantForm({ tenant, onSuccess }: Props) {
	const queryClient = useQueryClient();
	const mutation = useUpdateTenantMutation();

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<EditTenantFormValues>({
		resolver: zodResolver(EditTenantFormSchema),
		mode: "onTouched",
		values: {
			name: tenant.name,
			slug: tenant.slug,
			isActive: tenant.isActive,
			moduleAccessText: tenant.moduleAccess.join("\n"),
		},
	});

	function onSubmit(values: EditTenantFormValues) {
		const { moduleAccessText, ...rest } = values;
		const body: UpdateTenantInput = {
			...rest,
			...(moduleAccessText !== undefined && {
				moduleAccess: linesToArray(moduleAccessText),
			}),
		};
		mutation.mutate(
			{ tenantSlug: tenant.slug, body },
			{
				onSuccess: () => {
					queryClient.invalidateQueries({ queryKey: ["tenants"] });
					toast.success("Tenant updated.");
					onSuccess();
				},
				onError: (err) => toast.error(getApiErrorMessage(err)),
			},
		);
	}

	return (
		<form
			id="edit-tenant-form"
			onSubmit={handleSubmit(onSubmit)}
			className="flex flex-col gap-4 px-4"
		>
			<FieldGroup>
				<Field data-invalid={!!errors.name}>
					<FieldLabel htmlFor="name">Name</FieldLabel>
					<Input
						id="name"
						placeholder="Acme Corporation"
						aria-invalid={!!errors.name}
						{...register("name")}
					/>
					<FieldError errors={errors.name ? [errors.name] : []} />
				</Field>

				<Field data-invalid={!!errors.slug}>
					<FieldLabel htmlFor="slug">Slug</FieldLabel>
					<Input
						id="slug"
						placeholder="acme-corp"
						aria-invalid={!!errors.slug}
						{...register("slug")}
					/>
					<FieldError errors={errors.slug ? [errors.slug] : []} />
				</Field>

				<Field data-invalid={!!errors.moduleAccessText}>
					<FieldLabel htmlFor="moduleAccessText">
						Modules{" "}
						<span className="text-muted-foreground font-normal">
							(one per line)
						</span>
					</FieldLabel>
					<Textarea
						id="moduleAccessText"
						placeholder={"inventory\nprocurement\npos"}
						rows={3}
						aria-invalid={!!errors.moduleAccessText}
						{...register("moduleAccessText")}
					/>
					<FieldError
						errors={errors.moduleAccessText ? [errors.moduleAccessText] : []}
					/>
				</Field>

				<Field>
					<label className="flex items-center gap-2 text-sm cursor-pointer">
						<input
							type="checkbox"
							className="size-4 rounded border-input"
							{...register("isActive")}
						/>
						Active
					</label>
				</Field>
			</FieldGroup>

			<SheetFooter>
				<Button type="submit" form="edit-tenant-form" disabled={isSubmitting}>
					{isSubmitting ? "Saving…" : "Save changes"}
				</Button>
			</SheetFooter>
		</form>
	);
}
