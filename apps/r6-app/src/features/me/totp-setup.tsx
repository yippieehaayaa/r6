import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
	getTotpSetupFn,
	useDisableTotpMutation,
	useEnableTotpMutation,
} from "@/api/me";
import { Button } from "@/components/ui/button";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "@/components/ui/input-otp";
import { getApiErrorMessage } from "@/lib/api-error";

// ── Enable 2FA ────────────────────────────────────────────────

interface EnableFormProps {
	onSuccess: () => void;
}

type SetupStep = "loading" | "scan" | "confirm";

export function EnableTotpForm({ onSuccess }: EnableFormProps) {
	const enableMutation = useEnableTotpMutation();
	const [step, setStep] = useState<SetupStep>("loading");
	const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
	const [manualKey, setManualKey] = useState<string | null>(null);
	const [code, setCode] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	async function loadSetup() {
		if (step !== "loading") return;
		setIsLoading(true);
		try {
			const setup = await getTotpSetupFn();
			setQrCodeDataUrl(setup.qrCodeDataUrl);
			setManualKey(setup.manualEntryKey);
			setStep("scan");
		} catch (err) {
			toast.error(getApiErrorMessage(err));
		} finally {
			setIsLoading(false);
		}
	}

	// biome-ignore lint/correctness/useExhaustiveDependencies: loadSetup is stable; run only once on mount
	useEffect(() => {
		loadSetup();
	}, []);

	function onTotpComplete(value: string) {
		if (value.length !== 6) return;
		setCode(value);
	}

	function confirmCode() {
		if (code.length !== 6) return;
		enableMutation.mutate(
			{ code },
			{
				onSuccess: () => {
					toast.success("Two-factor authentication enabled.");
					onSuccess();
				},
				onError: (err) => {
					const msg = getApiErrorMessage(err);
					toast.error(msg);
					setCode("");
				},
			},
		);
	}

	if (isLoading || step === "loading") {
		return (
			<div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
				Generating QR code…
			</div>
		);
	}

	if (step === "scan" && qrCodeDataUrl) {
		return (
			<div className="flex flex-col gap-6 px-4 py-2">
				<div className="flex flex-col items-center gap-4">
					<img
						src={qrCodeDataUrl}
						alt="TOTP QR code — scan with your authenticator app"
						className="size-48 rounded-xl border border-border"
					/>
					{manualKey && (
						<div className="w-full rounded-lg bg-muted px-4 py-3 text-center">
							<p className="mb-1 text-[11px] text-muted-foreground uppercase tracking-wide">
								Manual entry key
							</p>
							<p className="font-mono text-sm tracking-widest break-all select-all">
								{manualKey}
							</p>
						</div>
					)}
				</div>
				<div className="flex justify-end">
					<Button onClick={() => setStep("confirm")}>
						I've scanned the QR code
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-6 px-4 py-2">
			<p className="text-sm text-muted-foreground text-center">
				Enter the 6-digit code shown in your authenticator app to confirm setup.
			</p>
			<div className="flex justify-center">
				<InputOTP
					maxLength={6}
					value={code}
					onChange={setCode}
					onComplete={onTotpComplete}
					disabled={enableMutation.isPending}
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
			<div className="flex flex-col gap-2">
				<Button
					className="w-full"
					disabled={code.length !== 6 || enableMutation.isPending}
					onClick={confirmCode}
				>
					{enableMutation.isPending ? "Verifying…" : "Confirm & enable"}
				</Button>
				<Button
					variant="ghost"
					className="w-full"
					onClick={() => {
						setStep("scan");
						setCode("");
					}}
				>
					Back
				</Button>
			</div>
		</div>
	);
}

// ── Disable 2FA ───────────────────────────────────────────────

interface DisableFormProps {
	onSuccess: () => void;
}

export function DisableTotpForm({ onSuccess }: DisableFormProps) {
	const mutation = useDisableTotpMutation();

	function handleDisable() {
		mutation.mutate(undefined, {
			onSuccess: () => {
				toast.success("Two-factor authentication disabled.");
				onSuccess();
			},
			onError: (err) => toast.error(getApiErrorMessage(err)),
		});
	}

	return (
		<div className="flex flex-col gap-6 py-2">
			<Button
				variant="destructive"
				disabled={mutation.isPending}
				onClick={handleDisable}
			>
				{mutation.isPending ? "Disabling…" : "Disable two-factor auth"}
			</Button>
		</div>
	);
}
