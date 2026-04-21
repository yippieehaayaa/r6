import { ChangePasswordCard } from "./change-password-card";
import { PermissionsCard } from "./permissions-card";
import { ProfileInfoCard } from "./profile-info-card";
import { TwoFactorCard } from "./two-factor-card";

export default function ProfilePage() {
	return (
		<div className="animate-apple-enter flex flex-col gap-6 p-6 md:p-8">
			<div className="flex flex-col gap-1">
				<h1 className="text-2xl font-semibold tracking-tight text-(--text-primary)">
					Account &amp; Security
				</h1>
				<p className="text-sm text-muted-foreground">
					Manage your profile, password, and security settings
				</p>
			</div>

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
				<ProfileInfoCard />
				<TwoFactorCard />
				<ChangePasswordCard />
				<PermissionsCard />
			</div>
		</div>
	);
}
