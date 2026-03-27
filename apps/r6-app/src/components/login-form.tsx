import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card"
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

export function LoginForm({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div className={cn("flex flex-col gap-4 w-full max-w-sm", className)} {...props}>
			<Card className="shadow-xl shadow-foreground/5 border-0 ring-1 ring-foreground/8 dark:ring-foreground/10 dark:shadow-foreground/30">
				<CardHeader className="text-center pb-2 pt-8 px-8">
					<div className="mx-auto mb-4 size-12 rounded-2xl bg-[var(--accent)] shadow-lg shadow-[var(--accent)]/30 flex items-center justify-center">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
							<path d="M12 11.5C13.933 11.5 15.5 9.933 15.5 8S13.933 4.5 12 4.5 8.5 6.067 8.5 8 10.067 11.5 12 11.5ZM12 13C9.515 13 5 14.253 5 16.75V18.5h14v-1.75C19 14.253 14.485 13 12 13Z" fill="white"/>
						</svg>
					</div>
					<CardTitle className="text-[22px] font-semibold tracking-tight text-[var(--text-primary)]">Sign In</CardTitle>
					<CardDescription className="text-sm text-[var(--text-secondary)] mt-1">
						Enter your credentials to continue
					</CardDescription>
				</CardHeader>
				<CardContent className="px-8 pb-8 pt-5">
					<form>
						<FieldGroup className="gap-4">
							<Field>
								<FieldLabel htmlFor="username" className="text-[13px] font-medium text-[var(--text-primary)]">Username</FieldLabel>
								<Input
									id="username"
									type="text"
									placeholder="username"
									autoComplete="username"
									className="h-10 rounded-xl text-[15px] px-3.5"
									required
								/>
							</Field>
							<Field>
								<div className="flex items-center justify-between">
									<FieldLabel htmlFor="password" className="text-[13px] font-medium text-[var(--text-primary)]">Password</FieldLabel>
									<a
										href="#"
										className="text-[13px] text-[var(--accent)] hover:opacity-75 transition-opacity"
									>
										Forgot password?
									</a>
								</div>
								<Input
									id="password"
									type="password"
									placeholder="••••••••"
									autoComplete="current-password"
									className="h-10 rounded-xl text-[15px] px-3.5"
									required
								/>
							</Field>
							<Button
								type="submit"
								className="w-full h-10 mt-1 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white text-[15px] font-medium shadow-md shadow-[var(--accent)]/20 transition-all border-0"
							>
								Sign In
							</Button>
						</FieldGroup>
					</form>
				</CardContent>
			</Card>
			<FieldDescription className="text-center text-[12px] text-[var(--text-secondary)] leading-relaxed">
				By signing in, you agree to our{" "}
				<a href="#" className="text-[var(--accent)] hover:opacity-75 transition-opacity underline-offset-2 hover:underline">
					Terms of Service
				</a>{" "}
				and{" "}
				<a href="#" className="text-[var(--accent)] hover:opacity-75 transition-opacity underline-offset-2 hover:underline">
					Privacy Policy
				</a>
				.
			</FieldDescription>
		</div>
	)
}
