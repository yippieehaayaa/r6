import { zodResolver } from "@hookform/resolvers/zod";
import { type CreateIdentityInput, CreateIdentitySchema } from "@r6/schemas";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { useCreateIdentityMutation } from "@/api/identity-and-access/identities";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SheetFooter } from "@/components/ui/sheet";
import { getApiErrorMessage } from "@/lib/api-error";

type CreateIdentityFormValues = z.input<typeof CreateIdentitySchema>;

interface Props {
	tenantSlug: string;
	onSuccess: () => void;
}

export function CreateIdentityForm({ tenantSlug, onSuccess }: Props) {
	const queryClient = useQueryClient();
	const mutation = useCreateIdentityMutation();

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<CreateIdentityFormValues>({
		resolver: zodResolver(CreateIdentitySchema),
		mode: "onTouched",
		defaultValues: {
			username: "",
			email: null,
			// Security: plainPassword is never pre-populated from any external source
			plainPassword: "",
			kind: "USER",
			mustChangePassword: false,
		},
	});

	function onSubmit(values: CreateIdentityFormValues) {
		mutation.mutate(
			{ tenantSlug, body: values as CreateIdentityInput },
			{
				onSuccess: () => {
					queryClient.invalidateQueries({
						queryKey: ["identities", tenantSlug],
					});
					toast.success("Identity created.");
					onSuccess();
				},
				onError: (err) => toast.error(getApiErrorMessage(err)),
			},
		);
	}

	return (
		<form
			id="create-identity-form"
			onSubmit={handleSubmit(onSubmit)}
			className="flex flex-col gap-4 px-4"
		>
			<FieldGroup>
				<Field data-invalid={!!errors.username}>
					<FieldLabel htmlFor="username">Username</FieldLabel>
					<Input
						id="username"
						placeholder="john.doe"
						aria-invalid={!!errors.username}
						{...register("username")}
					/>
					<FieldError errors={errors.username ? [errors.username] : []} />
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

				<Field data-invalid={!!errors.plainPassword}>
					<FieldLabel htmlFor="plainPassword">Password</FieldLabel>
					<Input
						id="plainPassword"
						type="password"
						placeholder="Min 8 chars, upper, lower, digit, special"
						aria-invalid={!!errors.plainPassword}
						autoComplete="new-password"
						{...register("plainPassword")}
					/>
					<FieldError
						errors={errors.plainPassword ? [errors.plainPassword] : []}
					/>
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
				<Button
					type="submit"
					form="create-identity-form"
					disabled={isSubmitting}
				>
					{isSubmitting ? "Creating…" : "Create"}
				</Button>
			</SheetFooter>
		</form>
	);
}
