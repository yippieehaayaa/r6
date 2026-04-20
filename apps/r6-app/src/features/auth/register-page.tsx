import { zodResolver } from "@hookform/resolvers/zod";
import {
	type RegisterInput,
	RegisterSchema,
	VerifyEmailRequestSchema,
} from "@r6/schemas";
import { Link, useNavigate } from "@tanstack/react-router";
import { GalleryVerticalEnd, Loader2Icon, MailIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useRegisterMutation } from "@/api/identity-and-access/registration/mutations/register";
import { useVerifyEmailMutation } from "@/api/identity-and-access/registration/mutations/verify-email";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "@/components/ui/input-otp";
import { parseApiError } from "@/lib/api-error";
import { cn } from "@/lib/utils";

type RegisterFormInput = RegisterInput & { confirmPassword: string };

export default function RegisterPage() {
	const navigate = useNavigate();
	const registerMutation = useRegisterMutation();
	const verifyEmailMutation = useVerifyEmailMutation();

	// After registration, show OTP verification step
	const [pendingEmail, setPendingEmail] = useState<string | null>(null);
	const [otpCode, setOtpCode] = useState("");
	const [isVerifying, setIsVerifying] = useState(false);

	const {
		register,
		handleSubmit,
		getValues,
		formState: { errors, isSubmitting },
	} = useForm<RegisterFormInput>({
		resolver: zodResolver(
			RegisterSchema.and(
				RegisterSchema.pick({ password: true })
					.extend({
						confirmPassword: RegisterSchema.shape.password,
					})
					.refine((d) => d.password === d.confirmPassword, {
						message: "Passwords do not match",
						path: ["confirmPassword"],
					}),
			),
		),
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
			navigate({ to: "/r6/login", replace: true });
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
			</div>
		</div>
	);
}

// ── Sub-components ────────────────────────────────────────────

interface RegisterCardProps {
	onSubmit: React.FormEventHandler;
	register: ReturnType<typeof useForm<RegisterFormInput>>["register"];
	errors: ReturnType<typeof useForm<RegisterFormInput>>["formState"]["errors"];
	isSubmitting: boolean;
}

function RegisterCard({
	onSubmit,
	register,
	errors,
	isSubmitting,
}: RegisterCardProps) {
	return (
		<div className="relative">
			<div className="absolute inset-0 translate-y-2 translate-x-2 rounded-2xl bg-foreground/[0.04] dark:bg-foreground/[0.06] ring-1 ring-foreground/8 dark:ring-foreground/10" />
			<Card className="relative border-0 ring-1 ring-foreground/8 dark:ring-foreground/10">
				<CardHeader className="text-center pb-2 pt-8 px-8">
					<div className="mx-auto mb-4 size-12 rounded-2xl bg-[var(--accent)] shadow-lg shadow-[var(--accent)]/30 flex items-center justify-center">
						<svg
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							aria-hidden="true"
						>
							<path
								d="M12 11.5C13.933 11.5 15.5 9.933 15.5 8S13.933 4.5 12 4.5 8.5 6.067 8.5 8 10.067 11.5 12 11.5ZM12 13C9.515 13 5 14.253 5 16.75V18.5h14v-1.75C19 14.253 14.485 13 12 13Z"
								fill="white"
							/>
						</svg>
					</div>
					<CardTitle className="text-[22px] font-semibold tracking-tight text-[var(--text-primary)]">
						Create an account
					</CardTitle>
					<CardDescription className="text-sm text-[var(--text-secondary)] mt-1">
						Fill in your details to get started
					</CardDescription>
				</CardHeader>
				<CardContent className="px-8 pb-8 pt-5">
					<form onSubmit={onSubmit}>
						<FieldGroup className="gap-4">
							<div className="grid grid-cols-2 gap-3">
								<Field data-invalid={!!errors.firstName}>
									<FieldLabel
										htmlFor="firstName"
										className="text-[13px] font-medium text-[var(--text-primary)]"
									>
										First Name
									</FieldLabel>
									<Input
										id="firstName"
										placeholder="John"
										autoComplete="given-name"
										className="h-10 rounded-xl text-[15px] px-3.5"
										{...register("firstName")}
									/>
									{errors.firstName && (
										<FieldError>{errors.firstName.message}</FieldError>
									)}
								</Field>
								<Field data-invalid={!!errors.lastName}>
									<FieldLabel
										htmlFor="lastName"
										className="text-[13px] font-medium text-[var(--text-primary)]"
									>
										Last Name
									</FieldLabel>
									<Input
										id="lastName"
										placeholder="Doe"
										autoComplete="family-name"
										className="h-10 rounded-xl text-[15px] px-3.5"
										{...register("lastName")}
									/>
									{errors.lastName && (
										<FieldError>{errors.lastName.message}</FieldError>
									)}
								</Field>
							</div>
							<Field data-invalid={!!errors.middleName}>
								<FieldLabel
									htmlFor="middleName"
									className="text-[13px] font-medium text-[var(--text-primary)]"
								>
									Middle Name{" "}
									<span className="text-[var(--text-secondary)] font-normal">
										(optional)
									</span>
								</FieldLabel>
								<Input
									id="middleName"
									placeholder="—"
									autoComplete="additional-name"
									className="h-10 rounded-xl text-[15px] px-3.5"
									{...register("middleName")}
								/>
								{errors.middleName && (
									<FieldError>{errors.middleName.message}</FieldError>
								)}
							</Field>
							<div className="grid grid-cols-2 gap-3">
								<Field data-invalid={!!errors.country}>
									<FieldLabel
										htmlFor="country"
										className="text-[13px] font-medium text-[var(--text-primary)]"
									>
										Country (ISO)
									</FieldLabel>
									<Input
										id="country"
										placeholder="PH"
										maxLength={2}
										autoComplete="country"
										className="h-10 rounded-xl text-[15px] px-3.5 uppercase"
										{...register("country")}
									/>
									{errors.country && (
										<FieldError>{errors.country.message}</FieldError>
									)}
								</Field>
								<Field data-invalid={!!errors.username}>
									<FieldLabel
										htmlFor="username"
										className="text-[13px] font-medium text-[var(--text-primary)]"
									>
										Username
									</FieldLabel>
									<Input
										id="username"
										placeholder="john.doe"
										autoComplete="username"
										className="h-10 rounded-xl text-[15px] px-3.5"
										{...register("username")}
									/>
									{errors.username && (
										<FieldError>{errors.username.message}</FieldError>
									)}
								</Field>
							</div>
							<Field data-invalid={!!errors.email}>
								<FieldLabel
									htmlFor="email"
									className="text-[13px] font-medium text-[var(--text-primary)]"
								>
									Email
								</FieldLabel>
								<Input
									id="email"
									type="email"
									placeholder="john@acme-corp.com"
									autoComplete="email"
									className="h-10 rounded-xl text-[15px] px-3.5"
									{...register("email")}
								/>
								{errors.email && (
									<FieldError>{errors.email.message}</FieldError>
								)}
							</Field>
							<Field data-invalid={!!errors.password}>
								<FieldLabel
									htmlFor="password"
									className="text-[13px] font-medium text-[var(--text-primary)]"
								>
									Password
								</FieldLabel>
								<Input
									id="password"
									type="password"
									placeholder="••••••••"
									autoComplete="new-password"
									className="h-10 rounded-xl text-[15px] px-3.5"
									{...register("password")}
								/>
								{errors.password && (
									<FieldError>{errors.password.message}</FieldError>
								)}
							</Field>
							<Field data-invalid={!!errors.confirmPassword}>
								<FieldLabel
									htmlFor="confirmPassword"
									className="text-[13px] font-medium text-[var(--text-primary)]"
								>
									Confirm Password
								</FieldLabel>
								<Input
									id="confirmPassword"
									type="password"
									placeholder="••••••••"
									autoComplete="new-password"
									className="h-10 rounded-xl text-[15px] px-3.5"
									{...register("confirmPassword")}
								/>
								{errors.confirmPassword && (
									<FieldError>{errors.confirmPassword.message}</FieldError>
								)}
							</Field>
							<Button
								type="submit"
								disabled={isSubmitting}
								className="w-full h-10 mt-1 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white text-[15px] font-medium shadow-md shadow-[var(--accent)]/20 transition-all border-0"
							>
								{isSubmitting ? (
									<>
										<Loader2Icon className="size-4 animate-spin" />
										Creating account...
									</>
								) : (
									"Create Account"
								)}
							</Button>
						</FieldGroup>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}

interface VerifyEmailCardProps {
	email: string;
	otpCode: string;
	onOtpChange: (code: string) => void;
	onOtpComplete: (code: string) => void;
	isVerifying: boolean;
	onBack: () => void;
}

function VerifyEmailCard({
	email,
	otpCode,
	onOtpChange,
	onOtpComplete,
	isVerifying,
	onBack,
}: VerifyEmailCardProps) {
	return (
		<div className={cn("flex flex-col gap-4 w-full max-w-sm")}>
			<div className="relative">
				<div className="absolute inset-0 translate-y-2 translate-x-2 rounded-2xl bg-foreground/[0.04] dark:bg-foreground/[0.06] ring-1 ring-foreground/8 dark:ring-foreground/10" />
				<Card className="relative border-0 ring-1 ring-foreground/8 dark:ring-foreground/10">
					<CardHeader className="text-center pb-2 pt-8 px-8">
						<div className="mx-auto mb-4 size-12 rounded-2xl bg-[var(--accent)] shadow-lg shadow-[var(--accent)]/30 flex items-center justify-center">
							<MailIcon className="size-5 text-white" />
						</div>
						<CardTitle className="text-[22px] font-semibold tracking-tight text-[var(--text-primary)]">
							Verify your email
						</CardTitle>
						<CardDescription className="text-sm text-[var(--text-secondary)] mt-1">
							Enter the 6-digit code sent to{" "}
							<span className="font-medium text-[var(--text-primary)]">
								{email}
							</span>
						</CardDescription>
					</CardHeader>
					<CardContent className="px-8 pb-8 pt-5">
						<FieldGroup className="gap-6 items-center">
							<div className="flex justify-center">
								<InputOTP
									maxLength={6}
									value={otpCode}
									onChange={onOtpChange}
									onComplete={onOtpComplete}
									disabled={isVerifying}
								>
									<InputOTPGroup>
										<InputOTPSlot index={0} />
										<InputOTPSlot index={1} />
										<InputOTPSlot index={2} />
										<InputOTPSlot index={3} />
										<InputOTPSlot index={4} />
										<InputOTPSlot index={5} />
									</InputOTPGroup>
								</InputOTP>
							</div>
							<Button
								type="button"
								disabled={isVerifying || otpCode.length !== 6}
								onClick={() => onOtpComplete(otpCode)}
								className="w-full h-10 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white text-[15px] font-medium shadow-md shadow-[var(--accent)]/20 transition-all border-0"
							>
								{isVerifying ? (
									<>
										<Loader2Icon className="size-4 animate-spin" />
										Verifying...
									</>
								) : (
									"Verify Email"
								)}
							</Button>
							<Button
								type="button"
								variant="ghost"
								className="w-full h-9 rounded-xl text-[13px] text-[var(--text-secondary)]"
								onClick={onBack}
							>
								Back to registration
							</Button>
						</FieldGroup>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
