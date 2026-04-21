import { zodResolver } from "@hookform/resolvers/zod";
import { type ChangePasswordInput, ChangePasswordSchema } from "@r6/schemas";
import { Loader2Icon, LockIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useChangePasswordMutation } from "@/api/identity-and-access/me/mutations/change-password";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { getApiErrorMessage } from "@/lib/api-error";
import { SectionCard } from "./section-card";

export function ChangePasswordCard() {
	const mutation = useChangePasswordMutation();

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<ChangePasswordInput>({
		resolver: zodResolver(ChangePasswordSchema),
		mode: "onTouched",
	});

	async function onSubmit(values: ChangePasswordInput) {
		try {
			await mutation.mutateAsync(values);
			toast.success("Password changed successfully");
			reset();
		} catch (err) {
			toast.error(getApiErrorMessage(err));
		}
	}

	return (
		<SectionCard
			icon={<LockIcon className="size-4 text-white" />}
			title="Change Password"
			description="Update your account password"
		>
			<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
				<FieldGroup>
					<Field data-invalid={!!errors.currentPassword}>
						<FieldLabel htmlFor="cp-current">Current Password</FieldLabel>
						<Input
							id="cp-current"
							type="password"
							placeholder="••••••••"
							autoComplete="current-password"
							className="h-10 rounded-xl"
							{...register("currentPassword")}
						/>
						<FieldError
							errors={errors.currentPassword ? [errors.currentPassword] : []}
						/>
					</Field>

					<Field data-invalid={!!errors.newPassword}>
						<FieldLabel htmlFor="cp-new">New Password</FieldLabel>
						<Input
							id="cp-new"
							type="password"
							placeholder="••••••••"
							autoComplete="new-password"
							className="h-10 rounded-xl"
							{...register("newPassword")}
						/>
						<FieldError
							errors={errors.newPassword ? [errors.newPassword] : []}
						/>
					</Field>

					<Field data-invalid={!!errors.confirmPassword}>
						<FieldLabel htmlFor="cp-confirm">Confirm New Password</FieldLabel>
						<Input
							id="cp-confirm"
							type="password"
							placeholder="••••••••"
							autoComplete="new-password"
							className="h-10 rounded-xl"
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
						disabled={isSubmitting}
						className="rounded-xl bg-accent hover:bg-(--accent)/90 text-white border-0"
					>
						{isSubmitting ? (
							<>
								<Loader2Icon className="size-4 animate-spin" />
								Saving…
							</>
						) : (
							"Change Password"
						)}
					</Button>
				</div>
			</form>
		</SectionCard>
	);
}
