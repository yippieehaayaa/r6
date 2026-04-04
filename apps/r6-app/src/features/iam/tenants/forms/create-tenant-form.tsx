import { zodResolver } from "@hookform/resolvers/zod";
import { type CreateTenantInput, CreateTenantSchema } from "@r6/schemas";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useCreateTenantMutation } from "@/api/tenants";
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

function toSlug(name: string): string {
	return name
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

function linesToArray(text: string): string[] {
	return text
		.split("\n")
		.map((l) => l.trim())
		.filter(Boolean);
}

// Form schema: replace the moduleAccess array with a plain text field
// so it can be edited as a textarea. Transform happens in onSubmit.
const CreateTenantFormSchema = CreateTenantSchema.omit({
	moduleAccess: true,
}).extend({
	moduleAccessText: z.string().min(1, "At least one module must be listed"),
});
type CreateTenantFormValues = z.infer<typeof CreateTenantFormSchema>;

interface Props {
	onSuccess: () => void;
}

export function CreateTenantForm({ onSuccess }: Props) {
	const queryClient = useQueryClient();
	const mutation = useCreateTenantMutation();
	const slugTouched = useRef(false);

	const {
		register,
		handleSubmit,
		watch,
		setValue,
		formState: { errors, isSubmitting },
	} = useForm<CreateTenantFormValues>({
		resolver: zodResolver(CreateTenantFormSchema),
		mode: "onTouched",
		defaultValues: {
			name: "",
			slug: "",
			moduleAccessText: "",
		},
	});

	const nameValue = watch("name");
	const { ref: slugRef, ...slugRest } = register("slug");

	// Auto-derive slug from name while the slug field is untouched
	useEffect(() => {
		if (!slugTouched.current) {
			setValue("slug", toSlug(nameValue ?? ""), { shouldValidate: true });
		}
	}, [nameValue, setValue]);

	function onSubmit(values: CreateTenantFormValues) {
		const body: CreateTenantInput = {
			name: values.name,
			slug: values.slug,
			moduleAccess: linesToArray(values.moduleAccessText),
		};
		mutation.mutate(body, {
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["tenants"] });
				toast.success("Tenant created.");
				onSuccess();
			},
			onError: (err) => toast.error(getApiErrorMessage(err)),
		});
	}

	return (
		<form
			id="create-tenant-form"
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
						ref={slugRef}
						{...slugRest}
						onChange={(e) => {
							slugTouched.current = true;
							slugRest.onChange(e);
						}}
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
			</FieldGroup>

			<SheetFooter>
				<Button type="submit" form="create-tenant-form" disabled={isSubmitting}>
					{isSubmitting ? "Creating…" : "Create"}
				</Button>
			</SheetFooter>
		</form>
	);
}
