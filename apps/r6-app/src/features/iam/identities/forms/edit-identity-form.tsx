import { zodResolver } from "@hookform/resolvers/zod";
import {
	type IdentitySafe,
	type UpdateIdentityInput,
	UpdateIdentitySchema,
} from "@r6/schemas";
import { useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { useUpdateIdentityMutation } from "@/api/identity-and-access/identities";
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
import { getApiErrorMessage } from "@/lib/api-error";

const STATUS_OPTIONS = [
	{ value: "ACTIVE", label: "Active" },
	{ value: "INACTIVE", label: "Inactive" },
	{ value: "SUSPENDED", label: "Suspended" },
	{ value: "PENDING_VERIFICATION", label: "Pending verification" },
] as const;

interface Props {
	tenantId: string;
	identity: IdentitySafe;
	onSuccess: () => void;
}

export function EditIdentityForm({ tenantId, identity, onSuccess }: Props) {
	const queryClient = useQueryClient();
	const mutation = useUpdateIdentityMutation();

	const {
		register,
		handleSubmit,
		control,
		formState: { errors, isSubmitting },
	} = useForm<UpdateIdentityInput>({
		resolver: zodResolver(UpdateIdentitySchema),
		mode: "onTouched",
		// `values` keeps the form in sync if the identity prop changes
		values: {
			email: identity.email,
			status: identity.status,
			mustChangePassword: identity.mustChangePassword,
		},
	});

	function onSubmit(values: UpdateIdentityInput) {
		mutation.mutate(
			{ tenantId, id: identity.id, body: values },
			{
				onSuccess: () => {
					queryClient.invalidateQueries({
						queryKey: ["identities", tenantId],
					});
					toast.success("Identity updated.");
					onSuccess();
				},
				onError: (err) => toast.error(getApiErrorMessage(err)),
			},
		);
	}

	return (
		<form
			id="edit-identity-form"
			onSubmit={handleSubmit(onSubmit)}
			className="flex flex-col gap-4 px-4"
		>
			<FieldGroup>
				<Field>
					<FieldLabel htmlFor="username">Username</FieldLabel>
					<Input
						id="username"
						value={identity.username}
						disabled
						readOnly
						className="opacity-60 cursor-not-allowed"
					/>
				</Field>

				<Field data-invalid={!!errors.email}>
					<FieldLabel htmlFor="email">Email (optional)</FieldLabel>
					<Input
						id="email"
						type="email"
						placeholder="john@example.com"
						aria-invalid={!!errors.email}
						{...register("email", {
							setValueAs: (v) => (v === "" ? null : v),
						})}
					/>
					<FieldError errors={errors.email ? [errors.email] : []} />
				</Field>

				<Field data-invalid={!!errors.status}>
					<FieldLabel htmlFor="status">Status</FieldLabel>
					<Controller
						name="status"
						control={control}
						render={({ field }) => (
							<Select value={field.value} onValueChange={field.onChange}>
								<SelectTrigger
									id="status"
									className="w-full"
									aria-invalid={!!errors.status}
								>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{STATUS_OPTIONS.map((opt) => (
										<SelectItem key={opt.value} value={opt.value}>
											{opt.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						)}
					/>
					<FieldError errors={errors.status ? [errors.status] : []} />
				</Field>

				<Field>
					<label className="flex items-center gap-2 text-sm cursor-pointer">
						<input
							type="checkbox"
							className="size-4 rounded border-input"
							{...register("mustChangePassword")}
						/>
						Must change password on next login
					</label>
				</Field>
			</FieldGroup>

			<SheetFooter>
				<Button type="submit" form="edit-identity-form" disabled={isSubmitting}>
					{isSubmitting ? "Saving…" : "Save changes"}
				</Button>
			</SheetFooter>
		</form>
	);
}
