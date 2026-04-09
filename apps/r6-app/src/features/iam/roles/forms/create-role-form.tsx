import { zodResolver } from "@hookform/resolvers/zod";
import { type CreateRoleInput, CreateRoleSchema } from "@r6/schemas";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useCreateRoleMutation } from "@/api/identity-and-access/roles";
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

interface Props {
	tenantSlug: string;
	tenantId: string | null;
	onSuccess: () => void;
}

export function CreateRoleForm({ tenantSlug, tenantId, onSuccess }: Props) {
	const queryClient = useQueryClient();
	const mutation = useCreateRoleMutation();

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<CreateRoleInput>({
		resolver: zodResolver(CreateRoleSchema),
		mode: "onTouched",
		defaultValues: {
			name: "",
			description: null,
			tenantId,
		},
	});

	function onSubmit(values: CreateRoleInput) {
		mutation.mutate(
			{ tenantSlug, body: values },
			{
				onSuccess: () => {
					queryClient.invalidateQueries({ queryKey: ["roles", tenantSlug] });
					toast.success("Role created.");
					onSuccess();
				},
				onError: (err) => toast.error(getApiErrorMessage(err)),
			},
		);
	}

	return (
		<form
			id="create-role-form"
			onSubmit={handleSubmit(onSubmit)}
			className="flex flex-col gap-4 px-4"
		>
			<FieldGroup>
				<Field data-invalid={!!errors.name}>
					<FieldLabel htmlFor="name">Name</FieldLabel>
					<Input
						id="name"
						placeholder="Warehouse Manager"
						aria-invalid={!!errors.name}
						{...register("name")}
					/>
					<FieldError errors={errors.name ? [errors.name] : []} />
				</Field>

				<Field data-invalid={!!errors.description}>
					<FieldLabel htmlFor="description">Description (optional)</FieldLabel>
					<Textarea
						id="description"
						placeholder="Describe what this role allows…"
						rows={3}
						aria-invalid={!!errors.description}
						{...register("description", {
							setValueAs: (v) => (v === "" ? null : v),
						})}
					/>
					<FieldError errors={errors.description ? [errors.description] : []} />
				</Field>
			</FieldGroup>

			<SheetFooter>
				<Button type="submit" form="create-role-form" disabled={isSubmitting}>
					{isSubmitting ? "Creating…" : "Create"}
				</Button>
			</SheetFooter>
		</form>
	);
}
