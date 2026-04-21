import { Loader2Icon } from "lucide-react";
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
import type { RegisterFormInput } from "./schema";

interface RegisterCardProps {
	onSubmit: React.FormEventHandler;
	register: ReturnType<typeof useForm<RegisterFormInput>>["register"];
	errors: ReturnType<typeof useForm<RegisterFormInput>>["formState"]["errors"];
	isSubmitting: boolean;
}

export function RegisterCard({
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
					<div className="mx-auto mb-4 size-12 rounded-2xl bg-[var(--accent)] shadow-lg flex items-center justify-center">
						<svg
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							aria-hidden="true"
						>
							<path
								d="M12 11.5C13.933 11.5 15.5 9.933 15.5 8S13.933 4.5 12 4.5 8.5 6.067 8.5 8 10.067 11.5 12 11.5ZM12 13C9.515 13 5 14.253 5 16.75V18.5h14v-1.75C19 14.253 14.485 13 12 13Z"
								className="fill-white"
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
						<FieldGroup className="animate-stagger-children gap-4">
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
								className="w-full h-10 mt-1 rounded-xl text-[15px] font-medium transition-all duration-150 active:scale-[0.97] bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white"
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
