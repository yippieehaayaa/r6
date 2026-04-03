import { useNavigate } from "@tanstack/react-router";
import { Loader2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/auth";
import { Button } from "@/components/ui/button";
import { parseApiError } from "@/lib/api-error";
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
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function LoginForm({
	className,
	...props
}: React.ComponentProps<"div">) {
	const navigate = useNavigate();
	const auth = useAuth();
	const [loading, setLoading] = useState(false);

	async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const login = (formData.get("login") as string).trim();
		const password = formData.get("password") as string;

		setLoading(true);
		try {
			await auth.login({ login, password });
			toast.success("Signed in successfully");
			navigate({ to: "/" });
		} catch (error) {
			const { code, message, details } = parseApiError(error);

			if (code === "account_locked") {
				const lockedUntil = (details as { lockedUntil?: string } | undefined)?.lockedUntil;
				const until = lockedUntil
					? new Intl.DateTimeFormat(undefined, {
							hour: "2-digit",
							minute: "2-digit",
					  }).format(new Date(lockedUntil))
					: null;
				toast.error(
					until
						? `Account locked. Try again after ${until}.`
						: "Account temporarily locked. Try again later.",
				);
			} else if (code === "account_inactive") {
				const status = (details as { status?: string } | undefined)?.status;
				const messages: Record<string, string> = {
					PENDING_VERIFICATION: "Account not yet verified. Please check your email.",
					SUSPENDED: "Account suspended. Please contact support.",
					INACTIVE: "Account is inactive. Please contact support.",
				};
				toast.error((status && messages[status]) ?? message);
			} else {
				toast.error(message);
			}
		} finally {
			setLoading(false);
		}
	}

	return (
		<div
			className={cn("flex flex-col gap-4 w-full max-w-sm", className)}
			{...props}
		>
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
							Sign In
						</CardTitle>
						<CardDescription className="text-sm text-[var(--text-secondary)] mt-1">
							Enter your credentials to continue
						</CardDescription>
					</CardHeader>
					<CardContent className="px-8 pb-8 pt-5">
						<form onSubmit={handleSubmit}>
							<FieldGroup className="gap-4">
								<Field>
									<FieldLabel
										htmlFor="login"
										className="text-[13px] font-medium text-[var(--text-primary)]"
									>
										Username
									</FieldLabel>
									<Input
										id="login"
										name="login"
										type="text"
										placeholder="john@acme-corp"
										autoComplete="username"
										className="h-10 rounded-xl text-[15px] px-3.5"
										required
									/>
								</Field>
								<Field>
									<div className="flex items-center justify-between">
										<FieldLabel
											htmlFor="password"
											className="text-[13px] font-medium text-[var(--text-primary)]"
										>
											Password
										</FieldLabel>
									</div>
									<Input
										id="password"
										name="password"
										type="password"
										placeholder="••••••••"
										autoComplete="current-password"
										className="h-10 rounded-xl text-[15px] px-3.5"
										required
									/>
								</Field>
								<Button
									type="submit"
									disabled={loading}
									className="w-full h-10 mt-1 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white text-[15px] font-medium shadow-md shadow-[var(--accent)]/20 transition-all border-0"
								>
									{loading ? (
										<>
											<Loader2Icon className="size-4 animate-spin" />
											Signing in...
										</>
									) : (
										"Sign In"
									)}
								</Button>
							</FieldGroup>
						</form>
					</CardContent>
				</Card>
			</div>
			<FieldDescription className="text-center text-[12px] text-[var(--text-secondary)] leading-relaxed">
				By signing in, you agree to our{" "}
				<a
					href="/"
					className="text-[var(--accent)] hover:opacity-75 transition-opacity underline-offset-2 hover:underline"
				>
					Terms of Service
				</a>{" "}
				and{" "}
				<a
					href="/"
					className="text-[var(--accent)] hover:opacity-75 transition-opacity underline-offset-2 hover:underline"
				>
					Privacy Policy
				</a>
				.
			</FieldDescription>
		</div>
	);
}
