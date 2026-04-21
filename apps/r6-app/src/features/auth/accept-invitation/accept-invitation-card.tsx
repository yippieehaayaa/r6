import type { AcceptInvitationInput } from "@r6/schemas";
import { Loader2Icon, MailCheckIcon } from "lucide-react";
import type { useForm } from "react-hook-form";
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

interface AcceptInvitationCardProps {
	onSubmit: (event: React.SubmitEvent<HTMLFormElement>) => void;
	register: ReturnType<typeof useForm<AcceptInvitationInput>>["register"];
	errors: ReturnType<
		typeof useForm<AcceptInvitationInput>
	>["formState"]["errors"];
	isSubmitting: boolean;
}

export function AcceptInvitationCard({
	onSubmit,
	register,
	errors,
	isSubmitting,
}: AcceptInvitationCardProps) {
	return (
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
						Sign in with your existing R6 account to join the organization
					</CardDescription>
				</CardHeader>
				<CardContent className="px-8 pb-8 pt-5">
					<form onSubmit={onSubmit}>
						<FieldGroup className="animate-stagger-children gap-4">
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
									autoComplete="current-password"
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
									autoComplete="current-password"
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
								className="w-full h-10 mt-1 rounded-xl text-[15px] font-medium transition-all duration-150 active:scale-[0.97] bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white"
							>
								{isSubmitting ? (
									<>
										<Loader2Icon className="size-4 animate-spin" />
										Accepting invitation...
									</>
								) : (
									"Accept Invitation"
								)}
							</Button>
						</FieldGroup>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
