import { zodResolver } from "@hookform/resolvers/zod";
import {
	type TotpDisableRequestInput,
	TotpDisableRequestSchema,
	type TotpEnableRequestInput,
	TotpEnableRequestSchema,
} from "@r6/schemas";
import { Loader2Icon, ShieldCheckIcon, ShieldOffIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useDisableTotpMutation } from "@/api/identity-and-access/me/mutations/disable-totp";
import { useEnableTotpMutation } from "@/api/identity-and-access/me/mutations/enable-totp";
import { useGetProfileQuery } from "@/api/identity-and-access/me/queries/get-profile";
import { useGetTotpSetupQuery } from "@/api/identity-and-access/me/queries/get-totp-setup";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiErrorMessage } from "@/lib/api-error";
import { SectionCard } from "./section-card";

// ── TOTP Enable ─────────────────────────────────────────────

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
				variant="accent"
				onClick={() => setSetupEnabled(true)}
				className="rounded-xl"
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
						variant="accent"
						className="rounded-xl"
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

// ── TOTP Disable ────────────────────────────────────────────

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

// ── Card ────────────────────────────────────────────────────

export function TwoFactorCard() {
	const { data: profile, isLoading, refetch } = useGetProfileQuery();

	return (
		<SectionCard
			icon={<ShieldCheckIcon className="size-4 text-white" />}
			title="Two-Factor Authentication"
			description="Add an extra layer of security to your account"
		>
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
		</SectionCard>
	);
}
