import { zodResolver } from "@hookform/resolvers/zod";
import type { ChangePasswordInput, Session } from "@r6/schemas";
import { ChangePasswordSchema } from "@r6/schemas";
import { formatDistanceToNow } from "date-fns";
import {
	ComputerIcon,
	KeyRoundIcon,
	Loader2Icon,
	MonitorSmartphoneIcon,
	QrCodeIcon,
	ShieldCheckIcon,
	ShieldOffIcon,
	UserCircleIcon,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
	useDisableTotpMutation,
	useEnableTotpMutation,
	useGetMeQuery,
	useGetSessionsQuery,
	useGetTotpSetupQuery,
	useUpdatePasswordMutation,
} from "@/api/identity-and-access";
import { Badge } from "@/components/ui/badge";
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
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "@/components/ui/input-otp";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getApiErrorMessage } from "@/lib/api-error";

// ── Helpers ───────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
	ACTIVE:
		"bg-[var(--badge-in-stock)]/15 text-[var(--badge-in-stock)] border-[var(--badge-in-stock)]/30",
	PENDING_VERIFICATION:
		"bg-[var(--badge-low-stock)]/15 text-[var(--badge-low-stock)] border-[var(--badge-low-stock)]/30",
	INACTIVE:
		"bg-[var(--badge-out-of-stock)]/15 text-[var(--badge-out-of-stock)] border-[var(--badge-out-of-stock)]/30",
	SUSPENDED:
		"bg-[var(--badge-out-of-stock)]/15 text-[var(--badge-out-of-stock)] border-[var(--badge-out-of-stock)]/30",
};

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
	return (
		<div className="flex flex-col gap-0.5 py-3 border-b border-[var(--border)] last:border-0">
			<span className="text-xs text-[var(--text-secondary)] uppercase tracking-wide font-medium">
				{label}
			</span>
			<span className="text-sm text-[var(--text-primary)]">{value}</span>
		</div>
	);
}

// ── Profile page ──────────────────────────────────────────────

export default function ProfilePage() {
	return (
		<div className="animate-apple-enter flex flex-1 flex-col gap-6 p-6">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
					Profile
				</h1>
				<p className="mt-1 text-sm text-[var(--text-secondary)]">
					Manage your account information and security settings
				</p>
			</div>

			<Tabs defaultValue="personal">
				<TabsList className="w-full sm:w-auto">
					<TabsTrigger value="personal">Personal Info</TabsTrigger>
					<TabsTrigger value="security">Security</TabsTrigger>
					<TabsTrigger value="sessions">Sessions</TabsTrigger>
				</TabsList>

				<TabsContent value="personal" className="mt-6">
					<PersonalInfoTab />
				</TabsContent>
				<TabsContent value="security" className="mt-6">
					<SecurityTab />
				</TabsContent>
				<TabsContent value="sessions" className="mt-6">
					<SessionsTab />
				</TabsContent>
			</Tabs>
		</div>
	);
}

// ── Personal Info tab ─────────────────────────────────────────

function PersonalInfoTab() {
	const { data: me, isLoading } = useGetMeQuery();

	if (isLoading) {
		return (
			<div className="flex h-48 items-center justify-center">
				<Loader2Icon className="size-6 animate-spin text-[var(--text-secondary)]" />
			</div>
		);
	}

	if (!me) return null;

	const fullName = [me.firstName, me.middleName, me.lastName]
		.filter(Boolean)
		.join(" ");

	return (
		<Card className="max-w-lg">
			<CardHeader className="flex flex-row items-center gap-4 pb-2">
				<div className="flex size-12 items-center justify-center rounded-full bg-[var(--accent)]/10">
					<UserCircleIcon className="size-6 text-[var(--accent)]" />
				</div>
				<div>
					<CardTitle className="text-base">{fullName}</CardTitle>
					<CardDescription>@{me.username}</CardDescription>
				</div>
			</CardHeader>
			<CardContent>
				<InfoRow label="Full Name" value={fullName} />
				<InfoRow
					label="Username"
					value={<span className="font-mono">{me.username}</span>}
				/>
				<InfoRow label="Email" value={me.email} />
				<InfoRow label="Country" value={me.country?.toUpperCase() ?? "—"} />
				<InfoRow
					label="Kind"
					value={
						<Badge variant="secondary" className="text-xs">
							{me.kind}
						</Badge>
					}
				/>
				<InfoRow
					label="Status"
					value={
						<Badge
							variant="outline"
							className={`text-xs border ${STATUS_COLORS[me.status] ?? ""}`}
						>
							{me.status.replace(/_/g, " ")}
						</Badge>
					}
				/>
			</CardContent>
		</Card>
	);
}

// ── Security tab ──────────────────────────────────────────────

function SecurityTab() {
	return (
		<div className="flex flex-col gap-6 max-w-lg">
			<ChangePasswordCard />
			<TotpCard />
		</div>
	);
}

function ChangePasswordCard() {
	const updatePasswordMutation = useUpdatePasswordMutation();

	const form = useForm<ChangePasswordInput>({
		resolver: zodResolver(ChangePasswordSchema),
		mode: "onTouched",
	});

	const {
		register,
		formState: { errors },
		reset,
	} = form;

	async function onSubmit(values: ChangePasswordInput) {
		try {
			await updatePasswordMutation.mutateAsync(values);
			toast.success("Password updated successfully.");
			reset();
		} catch (err) {
			toast.error(getApiErrorMessage(err));
		}
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center gap-2">
					<KeyRoundIcon className="size-4 text-[var(--text-secondary)]" />
					<CardTitle className="text-base">Change Password</CardTitle>
				</div>
				<CardDescription>Update your account password</CardDescription>
			</CardHeader>
			<CardContent>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="flex flex-col gap-4"
				>
					<FieldGroup className="gap-4">
						<Field data-invalid={!!errors.currentPassword}>
							<FieldLabel htmlFor="cp-current" className="text-[13px]">
								Current Password
							</FieldLabel>
							<Input
								id="cp-current"
								type="password"
								autoComplete="current-password"
								className="h-9 rounded-lg"
								{...register("currentPassword")}
							/>
							{errors.currentPassword && (
								<FieldError>{errors.currentPassword.message}</FieldError>
							)}
						</Field>
						<Field data-invalid={!!errors.newPassword}>
							<FieldLabel htmlFor="cp-new" className="text-[13px]">
								New Password
							</FieldLabel>
							<Input
								id="cp-new"
								type="password"
								autoComplete="new-password"
								className="h-9 rounded-lg"
								{...register("newPassword")}
							/>
							{errors.newPassword && (
								<FieldError>{errors.newPassword.message}</FieldError>
							)}
						</Field>
						<Field data-invalid={!!errors.confirmPassword}>
							<FieldLabel htmlFor="cp-confirm" className="text-[13px]">
								Confirm Password
							</FieldLabel>
							<Input
								id="cp-confirm"
								type="password"
								autoComplete="new-password"
								className="h-9 rounded-lg"
								{...register("confirmPassword")}
							/>
							{errors.confirmPassword && (
								<FieldError>{errors.confirmPassword.message}</FieldError>
							)}
						</Field>
					</FieldGroup>
					<Button
						type="submit"
						disabled={updatePasswordMutation.isPending}
						className="self-start bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white border-0"
					>
						{updatePasswordMutation.isPending ? (
							<>
								<Loader2Icon className="size-4 animate-spin" /> Updating…
							</>
						) : (
							"Update Password"
						)}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}

function TotpCard() {
	const [enableMode, setEnableMode] = useState(false);
	const [totpCode, setTotpCode] = useState("");
	const [disablePassword, setDisablePassword] = useState("");
	const [showDisable, setShowDisable] = useState(false);

	const { data: setup, refetch: refetchSetup } = useGetTotpSetupQuery({
		enabled: enableMode,
	});
	const enableMutation = useEnableTotpMutation();
	const disableMutation = useDisableTotpMutation();

	async function handleStartEnable() {
		setEnableMode(true);
		await refetchSetup();
	}

	async function handleConfirmEnable() {
		if (totpCode.length !== 6) return;
		try {
			await enableMutation.mutateAsync({ token: totpCode });
			toast.success("Two-factor authentication enabled.");
			setEnableMode(false);
			setTotpCode("");
		} catch (err) {
			toast.error(getApiErrorMessage(err));
		}
	}

	async function handleDisable() {
		if (!disablePassword) return;
		try {
			await disableMutation.mutateAsync({ password: disablePassword });
			toast.success("Two-factor authentication disabled.");
			setShowDisable(false);
			setDisablePassword("");
		} catch (err) {
			toast.error(getApiErrorMessage(err));
		}
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center gap-2">
					<ShieldCheckIcon className="size-4 text-[var(--text-secondary)]" />
					<CardTitle className="text-base">Two-Factor Authentication</CardTitle>
				</div>
				<CardDescription>
					Add an extra layer of security using an authenticator app
				</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-col gap-4">
				{!enableMode ? (
					<div className="flex flex-col gap-3">
						<p className="text-sm text-[var(--text-secondary)]">
							Use an authenticator app (e.g. Google Authenticator) to generate
							time-based codes.
						</p>
						{!showDisable ? (
							<div className="flex gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={handleStartEnable}
									className="gap-1.5"
								>
									<QrCodeIcon className="size-3.5" />
									Enable
								</Button>
								<Button
									variant="outline"
									size="sm"
									onClick={() => setShowDisable(true)}
									className="gap-1.5 text-[var(--badge-out-of-stock)] border-[var(--badge-out-of-stock)]/30 hover:bg-[var(--badge-out-of-stock)]/10"
								>
									<ShieldOffIcon className="size-3.5" />
									Disable
								</Button>
							</div>
						) : (
							<div className="flex flex-col gap-2">
								<p className="text-sm text-[var(--text-primary)]">
									Enter your account password to disable 2FA:
								</p>
								<Input
									type="password"
									placeholder="Current password"
									value={disablePassword}
									onChange={(e) => setDisablePassword(e.target.value)}
									className="h-9 rounded-lg max-w-xs"
								/>
								<div className="flex gap-2">
									<Button
										variant="outline"
										size="sm"
										onClick={() => {
											setShowDisable(false);
											setDisablePassword("");
										}}
									>
										Cancel
									</Button>
									<Button
										size="sm"
										variant="destructive"
										disabled={!disablePassword || disableMutation.isPending}
										onClick={handleDisable}
									>
										{disableMutation.isPending ? (
											<>
												<Loader2Icon className="size-3.5 animate-spin" />{" "}
												Disabling…
											</>
										) : (
											"Confirm Disable"
										)}
									</Button>
								</div>
							</div>
						)}
					</div>
				) : (
					<div className="flex flex-col gap-4">
						{setup?.qrCodeDataUrl && (
							<div className="flex flex-col items-center gap-3 p-4 rounded-lg border border-[var(--border)] bg-[var(--surface)]">
								<img
									src={setup.qrCodeDataUrl}
									alt="TOTP QR code"
									className="size-40 rounded-md"
								/>
								{setup.secret && (
									<p className="text-xs text-[var(--text-secondary)] text-center">
										Or enter manually:{" "}
										<code className="font-mono text-[var(--text-primary)]">
											{setup.secret}
										</code>
									</p>
								)}
							</div>
						)}
						<div className="flex flex-col gap-2">
							<span className="text-sm text-[var(--text-primary)]">
								Enter the 6-digit code from your app:
							</span>
							<InputOTP maxLength={6} value={totpCode} onChange={setTotpCode}>
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
						<div className="flex gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={() => {
									setEnableMode(false);
									setTotpCode("");
								}}
							>
								Cancel
							</Button>
							<Button
								size="sm"
								onClick={handleConfirmEnable}
								disabled={totpCode.length !== 6 || enableMutation.isPending}
								className="bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white border-0"
							>
								{enableMutation.isPending ? (
									<>
										<Loader2Icon className="size-3.5 animate-spin" /> Verifying…
									</>
								) : (
									"Confirm"
								)}
							</Button>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

// ── Sessions tab ──────────────────────────────────────────────

function SessionsTab() {
	const { data: sessions, isLoading } = useGetSessionsQuery();

	if (isLoading) {
		return (
			<div className="flex h-48 items-center justify-center">
				<Loader2Icon className="size-6 animate-spin text-[var(--text-secondary)]" />
			</div>
		);
	}

	if (!sessions?.length) {
		return (
			<div className="flex h-48 flex-col items-center justify-center gap-2 text-[var(--text-secondary)]">
				<MonitorSmartphoneIcon className="size-8 opacity-40" />
				<p className="text-sm">No active sessions found.</p>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-3 max-w-lg">
			{sessions.map((session: Session) => (
				<Card key={session.jti} className="p-4">
					<div className="flex items-start gap-3">
						<div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[var(--surface)]">
							<ComputerIcon className="size-4 text-[var(--text-secondary)]" />
						</div>
						<div className="flex flex-col gap-0.5 min-w-0">
							<span className="text-sm text-[var(--text-primary)] truncate">
								{session.userAgent ?? "Unknown device"}
							</span>
							<span className="text-xs text-[var(--text-secondary)]">
								{session.ipAddress ?? "Unknown IP"}
							</span>
							<span className="text-xs text-[var(--text-secondary)]">
								Expires{" "}
								{formatDistanceToNow(new Date(session.expiresAt), {
									addSuffix: true,
								})}
							</span>
						</div>
					</div>
				</Card>
			))}
		</div>
	);
}
