import { zodResolver } from "@hookform/resolvers/zod";
import { AcceptInvitationSchema } from "@r6/schemas";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { GalleryVerticalEnd, Loader2Icon, MailCheckIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useAcceptInvitationMutation } from "@/api/identity-and-access/invitations/mutations/accept-invitation";
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
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { parseApiError } from "@/lib/api-error";

type AcceptFormInput = {
	token: string;
	username: string;
	plainPassword: string;
	confirmPassword: string;
};

interface Props {
	token: string;
}

export default function AcceptInvitationPage({ token }: Props) {
	const navigate = useNavigate();
	const acceptMutation = useAcceptInvitationMutation();

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<AcceptFormInput>({
		resolver: zodResolver(
			AcceptInvitationSchema.and(
				AcceptInvitationSchema.pick({ plainPassword: true })
					.extend({
						confirmPassword: AcceptInvitationSchema.shape.plainPassword,
					})
					.refine((d) => d.plainPassword === d.confirmPassword, {
						message: "Passwords do not match",
						path: ["confirmPassword"],
					}),
			),
		),
		defaultValues: { token },
		mode: "onTouched",
	});

	async function onSubmit(values: AcceptFormInput) {
		const { confirmPassword: _, ...input } = values;
		try {
			await acceptMutation.mutateAsync(input);
			toast.success("Invitation accepted! You can now sign in.");
			navigate({ to: "/r6/login", replace: true });
		} catch (err) {
			const { code, message } = parseApiError(err);
			if (code === "invalid_token" || code === "invitation_expired") {
				toast.error("This invitation link is invalid or has expired.");
			} else {
				toast.error(message);
			}
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

				<div className="relative">
					<div className="absolute inset-0 translate-y-2 translate-x-2 rounded-2xl bg-foreground/[0.04] dark:bg-foreground/[0.06] ring-1 ring-foreground/8 dark:ring-foreground/10" />
					<Card className="relative border-0 ring-1 ring-foreground/8 dark:ring-foreground/10">
						<CardHeader className="text-center pb-2 pt-8 px-8">
							<div className="mx-auto mb-4 size-12 rounded-2xl bg-[var(--accent)] shadow-lg shadow-[var(--accent)]/30 flex items-center justify-center">
								<MailCheckIcon className="size-5 text-white" />
							</div>
							<CardTitle className="text-[22px] font-semibold tracking-tight text-[var(--text-primary)]">
								Accept Invitation
							</CardTitle>
							<CardDescription className="text-sm text-[var(--text-secondary)] mt-1">
								Set up your account to join your team
							</CardDescription>
						</CardHeader>
						<CardContent className="px-8 pb-8 pt-5">
							<form onSubmit={handleSubmit(onSubmit)}>
								<FieldGroup className="gap-4">
									<input type="hidden" {...register("token")} />
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
									<Field data-invalid={!!errors.plainPassword}>
										<FieldLabel
											htmlFor="plainPassword"
											className="text-[13px] font-medium text-[var(--text-primary)]"
										>
											Password
										</FieldLabel>
										<Input
											id="plainPassword"
											type="password"
											placeholder="••••••••"
											autoComplete="new-password"
											className="h-10 rounded-xl text-[15px] px-3.5"
											{...register("plainPassword")}
										/>
										{errors.plainPassword && (
											<FieldError>{errors.plainPassword.message}</FieldError>
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
												Accepting...
											</>
										) : (
											"Accept & Set Up Account"
										)}
									</Button>
								</FieldGroup>
							</form>
						</CardContent>
					</Card>
				</div>

				<p className="text-center text-[13px] text-[var(--text-secondary)]">
					Already have an account?{" "}
					<Link
						to="/r6/login"
						className="text-[var(--accent)] hover:opacity-75 transition-opacity font-medium"
					>
						Sign in
					</Link>
				</p>
			</div>
		</div>
	);
}
