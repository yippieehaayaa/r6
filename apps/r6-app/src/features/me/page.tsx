import { useAuth } from "@/auth";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { ChangePasswordForm } from "./change-password";
import { DisableTotpForm, EnableTotpForm } from "./totp-setup";

export default function AccountSecurityPage() {
	const { profile } = useAuth();

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

			<Card>
				<CardHeader>
					<CardTitle>Password</CardTitle>
					<CardDescription>
						Change your current password. You'll be signed out after saving.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<ChangePasswordForm onSuccess={() => {}} />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Two-Factor Authentication</CardTitle>
					<CardDescription>
						{profile?.totpEnabled
							? "Two-factor authentication is currently enabled on your account."
							: "Add an extra layer of security by requiring a one-time code on sign-in."}
					</CardDescription>
				</CardHeader>
				<CardContent>
					{profile?.totpEnabled ? (
						<DisableTotpForm onSuccess={() => {}} />
					) : (
						<EnableTotpForm onSuccess={() => {}} />
					)}
				</CardContent>
			</Card>
		</div>
	);
}
