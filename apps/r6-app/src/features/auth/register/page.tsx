import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "@tanstack/react-router";
import { GalleryVerticalEnd } from "lucide-react";
import { useState } from "react";
import { type Resolver, useForm } from "react-hook-form";
import { toast } from "sonner";
import { useRegisterMutation } from "@/api/identity-and-access/registration/mutations/register";
import { useVerifyEmailMutation } from "@/api/identity-and-access/registration/mutations/verify-email";
import { ModeToggle } from "@/components/mode-toggle";
import { parseApiError } from "@/lib/api-error";
import { Route } from "@/routes/r6/register";
import { RegisterCard } from "./register-card";
import { type RegisterFormInput, RegisterFormSchema } from "./schema";
import { VerifyEmailCard } from "./verify-email-card";

export default function RegisterPage() {
	const navigate = useNavigate();
	const { token } = Route.useSearch();
	const registerMutation = useRegisterMutation();
	const verifyEmailMutation = useVerifyEmailMutation();

	const [pendingEmail, setPendingEmail] = useState<string | null>(null);
	const [otpCode, setOtpCode] = useState("");
	const [isVerifying, setIsVerifying] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<RegisterFormInput>({
		resolver: zodResolver(RegisterFormSchema) as Resolver<RegisterFormInput>,
		mode: "onTouched",
	});

	async function onSubmit(values: RegisterFormInput) {
		const { confirmPassword: _, ...input } = values;
		try {
			await registerMutation.mutateAsync(input);
			setPendingEmail(input.email);
			toast.success(
				"Account created! Check your email for the verification code.",
			);
		} catch (err) {
			toast.error(parseApiError(err).message);
		}
	}

	async function onOtpComplete(code: string) {
		if (!pendingEmail || code.length !== 6) return;
		setIsVerifying(true);
		try {
			await verifyEmailMutation.mutateAsync({ email: pendingEmail, code });
			toast.success("Email verified! You can now sign in.");
			if (token) {
				navigate({ to: "/r6/accept-invitation", search: { token }, replace: true });
			} else {
				navigate({ to: "/r6/login", replace: true });
			}
		} catch (err) {
			const { code: errCode } = parseApiError(err);
			if (errCode === "invalid_otp" || errCode === "invalid_code") {
				toast.error("Incorrect code. Please try again.");
			} else if (errCode === "otp_expired") {
				toast.error("Code expired. Please register again.");
			} else {
				toast.error(parseApiError(err).message);
			}
			setOtpCode("");
		} finally {
			setIsVerifying(false);
		}
	}

	return (
		<div className="animate-apple-enter relative flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
			<div className="absolute top-4 right-4">
				<ModeToggle />
			</div>
			<div className="flex w-full max-w-sm flex-col gap-6">
				<Link
					to="/r6/login"
					className="flex items-center gap-2 self-center font-medium text-[var(--text-primary)]"
				>
					<div className="flex size-6 items-center justify-center rounded-md bg-[var(--accent)] text-white">
						<GalleryVerticalEnd className="size-4" />
					</div>
					R6 Inc.
				</Link>

				{pendingEmail ? (
					<VerifyEmailCard
						email={pendingEmail}
						otpCode={otpCode}
						onOtpChange={setOtpCode}
						onOtpComplete={onOtpComplete}
						isVerifying={isVerifying}
						onBack={() => {
							setPendingEmail(null);
							setOtpCode("");
						}}
					/>
				) : (
					<RegisterCard
						onSubmit={handleSubmit(onSubmit)}
						register={register}
						errors={errors}
						isSubmitting={isSubmitting}
					/>
				)}

				{!pendingEmail && (
					<p className="text-center text-[13px] text-[var(--text-secondary)]">
						Already have an account?{" "}
						<Link
							to="/r6/login"
							className="font-medium text-[var(--accent)] underline underline-offset-4 hover:opacity-70 transition-opacity"
						>
							Sign in
						</Link>
					</p>
				)}
			</div>
		</div>
	);
}
