import type { SessionsResponse } from "@r6/schemas";
import {
	ChevronRight,
	Lock,
	MonitorSmartphone,
	Shield,
	ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { useGetSessionsQuery } from "@/api/me";
import { useAuth } from "@/auth";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ChangePasswordForm } from "./change-password";
import { DisableTotpForm, EnableTotpForm } from "./totp-setup";

function formatRelativeTime(date: Date): string {
	const diffMs = Date.now() - date.getTime();
	const diffMins = Math.floor(diffMs / 60_000);
	if (diffMins < 1) return "Just now";
	if (diffMins < 60) return `${diffMins}m ago`;
	const diffHours = Math.floor(diffMins / 60);
	if (diffHours < 24) return `${diffHours}h ago`;
	const diffDays = Math.floor(diffHours / 24);
	return `${diffDays}d ago`;
}

function SessionRow({ session }: { session: SessionsResponse[number] }) {
	return (
		<div className="flex items-center gap-4 px-4 py-3.5">
			<span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
				<MonitorSmartphone className="size-4" />
			</span>
			<div className="flex-1 min-w-0">
				<p className="text-sm font-medium leading-none mb-0.5 truncate">
					{session.userAgent ?? "Unknown device"}
				</p>
				<p className="text-xs text-muted-foreground">
					{session.ipAddress ?? "Unknown IP"}
					{" · "}
					{formatRelativeTime(session.createdAt)}
				</p>
			</div>
		</div>
	);
}

export default function AccountSecurityPage() {
	const { profile } = useAuth();
	const [passwordOpen, setPasswordOpen] = useState(false);
	const [totpOpen, setTotpOpen] = useState(false);
	const { data: sessions, isLoading: sessionsLoading } = useGetSessionsQuery();

	return (
		<div className="flex flex-1 flex-col gap-6 p-4 pt-0 max-w-2xl">
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">
					Account Security
				</h1>
				<p className="text-sm text-muted-foreground">
					Manage your password and two-factor authentication.
				</p>
			</div>

			{/* Settings-style grouped list */}
			<div className="rounded-2xl border border-border bg-card overflow-hidden divide-y divide-border">
				{/* Password row */}
				<button
					type="button"
					onClick={() => setPasswordOpen(true)}
					className="flex w-full items-center gap-4 px-4 py-3.5 text-left transition-colors hover:bg-muted/50 active:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
				>
					<span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
						<Lock className="size-4" />
					</span>
					<div className="flex-1 min-w-0">
						<p className="text-sm font-medium leading-none mb-0.5">Password</p>
						<p className="text-xs text-muted-foreground truncate">
							Change your account password
						</p>
					</div>
					<ChevronRight className="size-4 text-muted-foreground/60 shrink-0" />
				</button>

				{/* Two-Factor Auth row */}
				<button
					type="button"
					onClick={() => setTotpOpen(true)}
					className="flex w-full items-center gap-4 px-4 py-3.5 text-left transition-colors hover:bg-muted/50 active:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
				>
					<span
						className={`flex size-9 shrink-0 items-center justify-center rounded-full ${
							profile?.totpEnabled
								? "bg-green-500/10 text-green-500"
								: "bg-muted text-muted-foreground"
						}`}
					>
						{profile?.totpEnabled ? (
							<ShieldCheck className="size-4" />
						) : (
							<Shield className="size-4" />
						)}
					</span>
					<div className="flex-1 min-w-0">
						<p className="text-sm font-medium leading-none mb-0.5">
							Two-Factor Authentication
						</p>
						<p
							className={`text-xs truncate ${
								profile?.totpEnabled
									? "text-green-500"
									: "text-muted-foreground"
							}`}
						>
							{profile?.totpEnabled ? "Enabled" : "Not enabled"}
						</p>
					</div>
					<ChevronRight className="size-4 text-muted-foreground/60 shrink-0" />
				</button>
			</div>

			{/* Active Sessions */}
			<div>
				<h2 className="text-base font-semibold tracking-tight mb-1">
					Active Sessions
				</h2>
				<p className="text-sm text-muted-foreground mb-3">
					Devices currently signed in to your account.
				</p>
				<div className="rounded-2xl border border-border bg-card overflow-hidden divide-y divide-border">
					{sessionsLoading ? (
						<>
							<div className="px-4 py-3.5">
								<Skeleton className="h-9.5 w-full" />
							</div>
							<div className="px-4 py-3.5">
								<Skeleton className="h-9.5 w-full" />
							</div>
						</>
					) : sessions && sessions.length > 0 ? (
						sessions.map((session) => (
							<SessionRow key={session.jti} session={session} />
						))
					) : (
						<div className="flex items-center justify-center px-4 py-6">
							<p className="text-sm text-muted-foreground">
								No active sessions
							</p>
						</div>
					)}
				</div>
			</div>

			{/* Change Password Dialog */}
			<Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Change Password</DialogTitle>
						<DialogDescription>
							You'll be signed out after saving your new password.
						</DialogDescription>
					</DialogHeader>
					<div className="overflow-y-auto px-5 pb-5">
						<ChangePasswordForm onSuccess={() => setPasswordOpen(false)} />
					</div>
				</DialogContent>
			</Dialog>

			{/* Two-Factor Auth Dialog */}
			<Dialog open={totpOpen} onOpenChange={setTotpOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Two-Factor Authentication</DialogTitle>
						<DialogDescription>
							{profile?.totpEnabled
								? "Disable the one-time code requirement on sign-in."
								: "Add an extra layer of security by requiring a one-time code on sign-in."}
						</DialogDescription>
					</DialogHeader>
					<div className="overflow-y-auto px-5 pb-5">
						{profile?.totpEnabled ? (
							<DisableTotpForm onSuccess={() => setTotpOpen(false)} />
						) : (
							<EnableTotpForm onSuccess={() => setTotpOpen(false)} />
						)}
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
