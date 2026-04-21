import {
	ChevronRightIcon,
	KeyRoundIcon,
	LockIcon,
	ShieldCheckIcon,
} from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { ChangePasswordCard } from "./change-password-card";
import { PermissionsCard } from "./permissions-card";
import { ProfileInfoCard } from "./profile-info-card";
import { TwoFactorCard } from "./two-factor-card";

const settingsRows = [
	{
		id: "password",
		icon: LockIcon,
		title: "Change Password",
		description: "Update your account password",
	},
	{
		id: "2fa",
		icon: ShieldCheckIcon,
		title: "Two-Factor Authentication",
		description: "Manage TOTP security for your account",
	},
	{
		id: "permissions",
		icon: KeyRoundIcon,
		title: "My Permissions",
		description: "View effective permissions on your account",
	},
] as const;

function SettingsRowContent({
	id,
}: {
	id: (typeof settingsRows)[number]["id"];
}) {
	if (id === "password") return <ChangePasswordCard />;
	if (id === "2fa") return <TwoFactorCard />;
	return <PermissionsCard />;
}

export default function ProfilePage() {
	return (
		<div className="animate-apple-enter flex flex-col gap-8 p-6 md:p-10">
			<div className="flex flex-col gap-1.5">
				<h1 className="text-[1.75rem] font-semibold tracking-tight text-(--text-primary)">
					Account &amp; Security
				</h1>
				<p className="text-sm text-(--text-secondary)">
					Manage your profile, password, and security settings
				</p>
			</div>

			<div className="animate-stagger-children grid grid-cols-1 gap-4 lg:grid-cols-2">
				{/* Profile Info — renders inline */}
				<ProfileInfoCard />

				{/* Settings rows — each opens a dialog */}
				<div className="overflow-hidden rounded-2xl bg-surface ring-1 ring-border">
					{settingsRows.map((row, index) => {
						const Icon = row.icon;
						return (
							<Dialog key={row.id}>
								<DialogTrigger asChild>
									<button
										type="button"
										className={`flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-(--bg) active:bg-(--bg) ${index > 0 ? "border-t border-(--border)" : ""}`}
									>
										<div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-accent shadow-sm">
											<Icon className="size-4 text-white" />
										</div>
										<div className="min-w-0 flex-1">
											<p className="text-sm font-semibold text-(--text-primary)">
												{row.title}
											</p>
											<p className="text-xs text-(--text-secondary)">
												{row.description}
											</p>
										</div>
										<ChevronRightIcon className="size-4 shrink-0 text-(--text-secondary)" />
									</button>
								</DialogTrigger>
								<DialogContent
									className={row.id === "2fa" ? "sm:max-w-lg" : undefined}
								>
									<DialogHeader>
										<DialogTitle>{row.title}</DialogTitle>
										<DialogDescription>{row.description}</DialogDescription>
									</DialogHeader>
									<div className="px-5 pb-5">
										<SettingsRowContent id={row.id} />
									</div>
								</DialogContent>
							</Dialog>
						);
					})}
				</div>
			</div>
		</div>
	);
}
