import { zodResolver } from "@hookform/resolvers/zod";
import {
	type ChangePasswordInput,
	ChangePasswordSchema,
	type TotpDisableRequestInput,
	TotpDisableRequestSchema,
	type TotpEnableRequestInput,
	TotpEnableRequestSchema,
} from "@r6/schemas";
import {
	KeyRoundIcon,
	Loader2Icon,
	LockIcon,
	ShieldCheckIcon,
	ShieldOffIcon,
	UserIcon,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useChangePasswordMutation } from "@/api/identity-and-access/me/mutations/change-password";
import { useDisableTotpMutation } from "@/api/identity-and-access/me/mutations/disable-totp";
import { useEnableTotpMutation } from "@/api/identity-and-access/me/mutations/enable-totp";
import { useGetProfileQuery } from "@/api/identity-and-access/me/queries/get-profile";
import { useGetTotpSetupQuery } from "@/api/identity-and-access/me/queries/get-totp-setup";
import { useListPermissionsQuery } from "@/api/identity-and-access/me/queries/list-permissions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { Skeleton } from "@/components/ui/skeleton";
import { getApiErrorMessage } from "@/lib/api-error";

// ── Profile Info ────────────────────────────────────────────

function ProfileInfoCard() {
	const { data: profile, isLoading } = useGetProfileQuery();

	const initials = profile?.username
		? profile.username
				.split(/[\s._-]/)
				.slice(0, 2)
				.map((s: string) => s[0]?.toUpperCase() ?? "")
				.join("")
		: "?";

	return (
		<Card className="border-0 ring-1 ring-foreground/8 dark:ring-foreground/10">
			<CardHeader className="pb-4">
				<div className="flex items-center gap-2">
					<div className="flex size-8 items-center justify-center rounded-lg bg-[var(--accent)] shadow-sm">
						<UserIcon className="size-4 text-white" />
					</div>
					<div>
						<CardTitle className="text-base">Account Info</CardTitle>
						<CardDescription className="text-xs">
							Your identity details
						</CardDescription>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<div className="flex items-center gap-4">
						<Skeleton className="size-14 rounded-xl" />
						<div className="flex flex-col gap-2">
							<Skeleton className="h-4 w-32" />
							<Skeleton className="h-3 w-48" />
							<Skeleton className="h-3 w-24" />
						</div>
					</div>
				) : profile ? (
					<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
						<Avatar className="size-14 rounded-xl">
							<AvatarFallback className="rounded-xl text-lg font-semibold bg-[var(--accent)]/10 text-[var(--accent)]">
								{initials}
							</AvatarFallback>
						</Avatar>
						<div className="flex flex-col gap-1.5">
							<div className="flex flex-wrap items-center gap-2">
								<span className="text-base font-semibold text-[var(--text-primary)]">
									{[profile.firstName, profile.middleName, profile.lastName]
										.filter(Boolean)
										.join(" ")}
								</span>
								<Badge variant="outline" className="capitalize text-[10px]">
									{profile.kind.toLowerCase()}
								</Badge>
								{profile.totpEnabled && (
									<Badge variant="default" className="gap-1 text-[10px]">
										<ShieldCheckIcon className="size-2.5" />
										2FA On
									</Badge>
								)}
							</div>
							<span className="text-sm text-muted-foreground">
								@{profile.username}
							</span>
							<span className="text-sm text-muted-foreground">
								{profile.email}
							</span>
							{profile.country && (
								<span className="text-xs text-muted-foreground uppercase tracking-wide">
									{profile.country}
								</span>
							)}
						</div>
					</div>
				) : null}
			</CardContent>
		</Card>
	);
}

// ── Change Password ─────────────────────────────────────────

function ChangePasswordCard() {
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
		<Card className="border-0 ring-1 ring-foreground/8 dark:ring-foreground/10">
			<CardHeader className="pb-4">
				<div className="flex items-center gap-2">
					<div className="flex size-8 items-center justify-center rounded-lg bg-[var(--accent)] shadow-sm">
						<LockIcon className="size-4 text-white" />
					</div>
					<div>
						<CardTitle className="text-base">Change Password</CardTitle>
						<CardDescription className="text-xs">
							Update your account password
						</CardDescription>
					</div>
				</div>
			</CardHeader>
			<CardContent>
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
							className="rounded-xl bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white border-0"
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
			</CardContent>
		</Card>
	);
}

// ── TOTP Setup Flow ─────────────────────────────────────────

function TotpEnableFlow({ onDone }: { onDone: () => void }) {
	const [setupEnabled, setSetupEnabled] = useState(false);
	const setupQuery = useGetTotpSetupQuery({ enabled: setupEnabled });
	const enableMutation = useEnableTotpMutation();

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<TotpEnableRequestInput>({
		resolver: zodResolver(TotpEnableRequestSchema),
		mode: "onTouched",
	});

	async function onSubmit(values: TotpEnableRequestInput) {
		try {
			await enableMutation.mutateAsync(values);
			toast.success("Two-factor authentication enabled");
			reset();
			onDone();
		} catch (err) {
			toast.error(getApiErrorMessage(err));
		}
	}

	if (!setupEnabled) {
		return (
			<Button
				type="button"
				onClick={() => setSetupEnabled(true)}
				className="rounded-xl bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white border-0"
			>
				<ShieldCheckIcon className="size-4" />
				Set Up 2FA
			</Button>
		);
	}

	if (setupQuery.isLoading) {
		return (
			<div className="flex flex-col gap-3">
				<Skeleton className="h-40 w-40 rounded-xl" />
				<Skeleton className="h-4 w-56" />
				<Skeleton className="h-10 w-full rounded-xl" />
			</div>
		);
	}

	const setup = setupQuery.data;
	if (!setup) return null;

	return (
		<div className="flex flex-col gap-5">
			<div className="flex flex-col gap-3">
				<p className="text-sm text-muted-foreground">
					Scan the QR code with your authenticator app (e.g. Google
					Authenticator, Authy), then enter the 6-digit code to confirm.
				</p>
				<div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-5">
					<img
						src={setup.qrDataUrl}
						alt="TOTP QR code"
						className="size-36 rounded-xl border p-1"
					/>
					<div className="flex flex-col gap-1.5">
						<p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
							Manual entry key
						</p>
						<code className="rounded-lg bg-muted px-2.5 py-1.5 font-mono text-sm break-all">
							{setup.secret}
						</code>
					</div>
				</div>
			</div>

			<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
				<FieldGroup>
					<Field data-invalid={!!errors.code}>
						<FieldLabel htmlFor="totp-code">Verification Code</FieldLabel>
						<Input
							id="totp-code"
							placeholder="000000"
							maxLength={6}
							inputMode="numeric"
							autoComplete="one-time-code"
							className="h-10 rounded-xl font-mono tracking-widest"
							{...register("code")}
						/>
						<FieldError errors={errors.code ? [errors.code] : []} />
					</Field>
				</FieldGroup>

				<div className="flex gap-2">
					<Button
						type="button"
						variant="outline"
						className="rounded-xl"
						onClick={() => {
							setSetupEnabled(false);
							reset();
						}}
					>
						Cancel
					</Button>
					<Button
						type="submit"
						disabled={isSubmitting}
						className="rounded-xl bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white border-0"
					>
						{isSubmitting ? (
							<>
								<Loader2Icon className="size-4 animate-spin" />
								Verifying…
							</>
						) : (
							"Enable 2FA"
						)}
					</Button>
				</div>
			</form>
		</div>
	);
}

function TotpDisableFlow({ onDone }: { onDone: () => void }) {
	const [confirming, setConfirming] = useState(false);
	const disableMutation = useDisableTotpMutation();

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<TotpDisableRequestInput>({
		resolver: zodResolver(TotpDisableRequestSchema),
		mode: "onTouched",
	});

	async function onSubmit(values: TotpDisableRequestInput) {
		try {
			await disableMutation.mutateAsync(values);
			toast.success("Two-factor authentication disabled");
			reset();
			onDone();
		} catch (err) {
			toast.error(getApiErrorMessage(err));
		}
	}

	if (!confirming) {
		return (
			<Button
				type="button"
				variant="outline"
				onClick={() => setConfirming(true)}
				className="rounded-xl border-destructive/40 text-destructive hover:bg-destructive/5 hover:text-destructive"
			>
				<ShieldOffIcon className="size-4" />
				Disable 2FA
			</Button>
		);
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
			<p className="text-sm text-muted-foreground">
				Enter your current password to confirm disabling two-factor
				authentication.
			</p>
			<FieldGroup>
				<Field data-invalid={!!errors.password}>
					<FieldLabel htmlFor="totp-disable-password">
						Current Password
					</FieldLabel>
					<Input
						id="totp-disable-password"
						type="password"
						placeholder="••••••••"
						autoComplete="current-password"
						className="h-10 rounded-xl"
						{...register("password")}
					/>
					<FieldError errors={errors.password ? [errors.password] : []} />
				</Field>
			</FieldGroup>

			<div className="flex gap-2">
				<Button
					type="button"
					variant="outline"
					className="rounded-xl"
					onClick={() => {
						setConfirming(false);
						reset();
					}}
				>
					Cancel
				</Button>
				<Button
					type="submit"
					disabled={isSubmitting}
					variant="destructive"
					className="rounded-xl"
				>
					{isSubmitting ? (
						<>
							<Loader2Icon className="size-4 animate-spin" />
							Disabling…
						</>
					) : (
						"Confirm Disable"
					)}
				</Button>
			</div>
		</form>
	);
}

function TwoFactorCard() {
	const { data: profile, isLoading, refetch } = useGetProfileQuery();

	return (
		<Card className="border-0 ring-1 ring-foreground/8 dark:ring-foreground/10">
			<CardHeader className="pb-4">
				<div className="flex items-center gap-2">
					<div className="flex size-8 items-center justify-center rounded-lg bg-[var(--accent)] shadow-sm">
						<ShieldCheckIcon className="size-4 text-white" />
					</div>
					<div>
						<CardTitle className="text-base">
							Two-Factor Authentication
						</CardTitle>
						<CardDescription className="text-xs">
							Add an extra layer of security to your account
						</CardDescription>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<div className="flex flex-col gap-3">
						<Skeleton className="h-4 w-64" />
						<Skeleton className="h-9 w-28 rounded-xl" />
					</div>
				) : profile?.totpEnabled ? (
					<div className="flex flex-col gap-3">
						<div className="flex items-center gap-2">
							<Badge variant="default" className="gap-1">
								<ShieldCheckIcon className="size-3" />
								Enabled
							</Badge>
							<span className="text-sm text-muted-foreground">
								Your account is protected with TOTP authentication.
							</span>
						</div>
						<TotpDisableFlow onDone={() => refetch()} />
					</div>
				) : (
					<div className="flex flex-col gap-3">
						<p className="text-sm text-muted-foreground">
							Two-factor authentication is not enabled. Enable it to secure your
							account with a time-based one-time password.
						</p>
						<TotpEnableFlow onDone={() => refetch()} />
					</div>
				)}
			</CardContent>
		</Card>
	);
}

// ── Permissions List ────────────────────────────────────────

function PermissionsCard() {
	const { data, isLoading } = useListPermissionsQuery({ page: 1, limit: 100 });
	const permissions = data?.data ?? [];

	return (
		<Card className="border-0 ring-1 ring-foreground/8 dark:ring-foreground/10">
			<CardHeader className="pb-4">
				<div className="flex items-center gap-2">
					<div className="flex size-8 items-center justify-center rounded-lg bg-[var(--accent)] shadow-sm">
						<KeyRoundIcon className="size-4 text-white" />
					</div>
					<div>
						<CardTitle className="text-base">My Permissions</CardTitle>
						<CardDescription className="text-xs">
							Effective permissions granted to your account
						</CardDescription>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<div className="flex flex-wrap gap-1.5">
						{Array.from({ length: 6 }).map((_, i) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton items
							<Skeleton key={i} className="h-5 w-28 rounded-md" />
						))}
					</div>
				) : permissions.length === 0 ? (
					<p className="text-sm text-muted-foreground">
						No permissions assigned to your account.
					</p>
				) : (
					<div className="flex flex-wrap gap-1.5">
						{permissions.map((p: { id: string; permission: string }) => (
							<Badge
								key={p.id}
								variant="outline"
								className="h-5 px-2 font-mono text-[10px]"
							>
								{p.permission}
							</Badge>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}

// ── Page ────────────────────────────────────────────────────

export default function ProfilePage() {
	return (
		<div className="animate-apple-enter flex flex-col gap-6 p-6 md:p-8">
			{/* Header */}
			<div className="flex flex-col gap-1">
				<h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
					Account &amp; Security
				</h1>
				<p className="text-sm text-muted-foreground">
					Manage your profile, password, and security settings
				</p>
			</div>

			{/* Cards */}
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
				<ProfileInfoCard />
				<TwoFactorCard />
				<ChangePasswordCard />
				<PermissionsCard />
			</div>
		</div>
	);
}
