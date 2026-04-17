import { zodResolver } from "@hookform/resolvers/zod";
import { type Role, type UpdateRoleInput, UpdateRoleSchema } from "@r6/schemas";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useUpdateRoleMutation } from "@/api/identity-and-access/roles";
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
	tenantId: string;
	role: Role;
	onSuccess: () => void;
}

export function EditRoleForm({ tenantId, role, onSuccess }: Props) {
	const queryClient = useQueryClient();
	const mutation = useUpdateRoleMutation();

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<UpdateRoleInput>({
		resolver: zodResolver(UpdateRoleSchema),
		mode: "onTouched",
		values: {
			name: role.name,
			description: role.description,
			isActive: role.isActive,
		},
	});

	function onSubmit(values: UpdateRoleInput) {
		mutation.mutate(
			{ tenantId, id: role.id, body: values },
			{
				onSuccess: () => {
					queryClient.invalidateQueries({ queryKey: ["roles", tenantId] });
					toast.success("Role updated.");
					onSuccess();
				},
				onError: (err) => toast.error(getApiErrorMessage(err)),
			},
		);
	}

	return (
		<form
			id="edit-role-form"
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
				<Button type="submit" form="edit-role-form" disabled={isSubmitting}>
					{isSubmitting ? "Saving…" : "Save changes"}
				</Button>
			</SheetFooter>
		</form>
	);
}
