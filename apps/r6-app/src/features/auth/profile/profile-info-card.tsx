import { ShieldCheckIcon, UserIcon } from "lucide-react";
import { useGetProfileQuery } from "@/api/identity-and-access/me/queries/get-profile";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionCard } from "./section-card";

function getInitials(username?: string): string {
	if (!username) return "?";
	return username
		.split(/[\s._-]/)
		.slice(0, 2)
		.map((s) => s[0]?.toUpperCase() ?? "")
		.join("");
}

export function ProfileInfoCard() {
	const { data: profile, isLoading } = useGetProfileQuery();
	const initials = getInitials(profile?.username);

	return (
		<SectionCard
			icon={<UserIcon className="size-4 text-white" />}
			title="Account Info"
			description="Your identity details"
		>
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
						<AvatarFallback className="rounded-xl text-lg font-semibold bg-(--accent)/10 text-(--accent)">
							{initials}
						</AvatarFallback>
					</Avatar>
					<div className="flex flex-col gap-1.5">
						<div className="flex flex-wrap items-center gap-2">
							<span className="text-base font-semibold text-(--text-primary)">
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
		</SectionCard>
	);
}
