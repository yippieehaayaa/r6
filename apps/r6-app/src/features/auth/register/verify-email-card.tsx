import { Loader2Icon, MailIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "@/components/ui/input-otp";

interface VerifyEmailCardProps {
	email: string;
	otpCode: string;
	onOtpChange: (code: string) => void;
	onOtpComplete: (code: string) => void;
	isVerifying: boolean;
	onBack: () => void;
}

export function VerifyEmailCard({
	email,
	otpCode,
	onOtpChange,
	onOtpComplete,
	isVerifying,
	onBack,
}: VerifyEmailCardProps) {
	return (
		<div className="flex flex-col gap-4 w-full max-w-sm">
			<div className="relative">
				<div className="absolute inset-0 translate-y-2 translate-x-2 rounded-2xl bg-foreground/[0.04] dark:bg-foreground/[0.06] ring-1 ring-foreground/8 dark:ring-foreground/10" />
				<Card className="relative border-0 ring-1 ring-foreground/8 dark:ring-foreground/10">
					<CardHeader className="text-center pb-2 pt-8 px-8">
						<div className="mx-auto mb-4 size-12 rounded-2xl bg-[var(--accent)] shadow-lg flex items-center justify-center">
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
						<FieldGroup className="animate-stagger-children gap-6 items-center">
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
								className="w-full h-10 rounded-xl text-[15px] font-medium transition-all duration-150 active:scale-[0.97] bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white"
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
