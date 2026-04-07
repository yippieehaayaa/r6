import { zodResolver } from "@hookform/resolvers/zod";
import { type ChangePasswordInput, ChangePasswordSchema } from "@r6/schemas";
import { useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useUpdatePasswordMutation } from "@/api/me";
import { useAuth } from "@/auth";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { getApiErrorMessage } from "@/lib/api-error";

interface FormProps {
	onSuccess: () => void;
}

export function ChangePasswordForm({ onSuccess }: FormProps) {
	const mutation = useUpdatePasswordMutation();
	const { logout } = useAuth();
	const navigate = useNavigate();

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<ChangePasswordInput>({
		resolver: zodResolver(ChangePasswordSchema),
		mode: "onTouched",
	});

	function onSubmit(values: ChangePasswordInput) {
		mutation.mutate(values, {
			onSuccess: async () => {
				reset();
				onSuccess();
				toast.success("Password changed. Please log in again.");
				await logout();
				navigate({ to: "/r6/login", replace: true });
			},
			onError: (err) => toast.error(getApiErrorMessage(err)),
		});
	}

	return (
		<form
			id="change-password-form"
			onSubmit={handleSubmit(onSubmit)}
			className="flex flex-col gap-4 px-4"
		>
			<FieldGroup>
				<Field data-invalid={!!errors.currentPassword}>
					<FieldLabel htmlFor="currentPassword">Current password</FieldLabel>
					<Input
						id="currentPassword"
						type="password"
						aria-invalid={!!errors.currentPassword}
						{...register("currentPassword")}
					/>
					<FieldError
						errors={errors.currentPassword ? [errors.currentPassword] : []}
					/>
				</Field>

				<Field data-invalid={!!errors.newPassword}>
					<FieldLabel htmlFor="newPassword">New password</FieldLabel>
					<Input
						id="newPassword"
						type="password"
						aria-invalid={!!errors.newPassword}
						{...register("newPassword")}
					/>
					<FieldError errors={errors.newPassword ? [errors.newPassword] : []} />
				</Field>

				<Field data-invalid={!!errors.confirmPassword}>
					<FieldLabel htmlFor="confirmPassword">
						Confirm new password
					</FieldLabel>
					<Input
						id="confirmPassword"
						type="password"
						aria-invalid={!!errors.confirmPassword}
						{...register("confirmPassword")}
					/>
					<FieldError
						errors={errors.confirmPassword ? [errors.confirmPassword] : []}
					/>
				</Field>
			</FieldGroup>

			<div className="flex justify-end">
				<Button
					type="submit"
					form="change-password-form"
					disabled={isSubmitting}
				>
					{isSubmitting ? "Saving…" : "Change password"}
				</Button>
			</div>
		</form>
	);
}
