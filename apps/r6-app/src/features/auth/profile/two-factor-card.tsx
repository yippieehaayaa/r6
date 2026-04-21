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
				<p className="text-sm text-(--text-secondary)">
					Scan the QR code with your authenticator app (e.g. Google
					Authenticator, Authy), then enter the 6-digit code to confirm.
				</p>
				<div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
					<div className="rounded-2xl border border-(--border) bg-surface p-2 shadow-sm">
						<img
							src={setup.qrDataUrl}
							alt="TOTP QR code"
							className="size-36 rounded-xl"
						/>
					</div>
					<div className="flex flex-col gap-2">
						<p className="text-[10px] font-semibold uppercase tracking-widest text-(--text-secondary)">
							Manual entry key
						</p>
						<code className="rounded-xl bg-(--bg) px-3 py-2 font-mono text-sm break-all text-(--text-primary) ring-1 ring-border">
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
							className="h-10 rounded-xl bg-(--bg) font-mono tracking-widest"
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
			<p className="text-sm text-(--text-secondary)">
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
						className="h-10 rounded-xl bg-(--bg)"
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
		<>
			{isLoading ? (
				<div className="flex flex-col gap-3">
					<Skeleton className="h-14 w-full rounded-xl" />
					<Skeleton className="h-9 w-28 rounded-xl" />
				</div>
			) : profile?.totpEnabled ? (
				<div className="flex flex-col gap-4">
					<div className="flex items-center gap-3 rounded-xl bg-(--bg) px-4 py-3">
						<span className="size-2 shrink-0 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.5)]" />
						<div className="flex flex-col gap-0.5">
							<span className="text-sm font-medium text-(--text-primary)">
								Two-factor authentication is on
							</span>
							<span className="text-xs text-(--text-secondary)">
								Your account is protected with TOTP.
							</span>
						</div>
						<Badge
							variant="default"
							className="ml-auto gap-1 text-[10px] shrink-0"
						>
							<ShieldCheckIcon className="size-2.5" />
							Active
						</Badge>
					</div>
					<TotpDisableFlow onDone={() => refetch()} />
				</div>
			) : (
				<div className="flex flex-col gap-4">
					<div className="flex items-center gap-3 rounded-xl bg-(--bg) px-4 py-3">
						<span className="size-2 shrink-0 rounded-full bg-orange-400" />
						<div className="flex flex-col gap-0.5">
							<span className="text-sm font-medium text-(--text-primary)">
								Two-factor authentication is off
							</span>
							<span className="text-xs text-(--text-secondary)">
								Enable TOTP to add an extra layer of protection.
							</span>
						</div>
					</div>
					<TotpEnableFlow onDone={() => refetch()} />
				</div>
			)}
		</>
	);
}
