"use client";

import { Link } from "@tanstack/react-router";
import {
	// BadgeCheck,
	// Bell,
	ChevronsUpDown,
	// CreditCard,
	ShieldCheck,
	// Sparkles,
} from "lucide-react";
import { LogoutMenuItem } from "#/features/auth/logout";
import { useGetProfileQuery } from "@/api/identity-and-access/me/queries/get-profile";
import { useAuth } from "@/auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	// DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";

export function NavUser() {
	const { isMobile } = useSidebar();
	const { profile: authProfile } = useAuth();
	const { data: profile } = useGetProfileQuery();

	const middleInitial = profile?.middleName
		? `${profile.middleName[0]?.toUpperCase()}.`
		: null;
	const fullName = [profile?.firstName, middleInitial, profile?.lastName]
		.filter(Boolean)
		.join(" ") || "…";
	const email = authProfile?.email ?? "";
	const initials = [profile?.firstName, profile?.lastName]
		.filter(Boolean)
		.map((s) => s?.[0]?.toUpperCase() ?? "")
		.join("");

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size="lg"
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<Avatar className="h-8 w-8 rounded-lg">
								<AvatarFallback className="rounded-lg">
									{initials}
								</AvatarFallback>
							</Avatar>
							<div className="grid flex-1 text-left text-sm leading-tight">
							<span className="truncate font-medium">{fullName}</span>
								<span className="truncate text-xs">{email}</span>
							</div>
							<ChevronsUpDown className="ml-auto size-4" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
						side={isMobile ? "bottom" : "right"}
						align="end"
						sideOffset={4}
					>
						<DropdownMenuLabel className="p-0 font-normal">
							<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
								<Avatar className="h-8 w-8 rounded-lg">
									<AvatarFallback className="rounded-lg">
										{initials}
									</AvatarFallback>
								</Avatar>
								<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-medium">{fullName}</span>
									<span className="truncate text-xs">{email}</span>
								</div>
							</div>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						{/* <DropdownMenuGroup>
							<DropdownMenuItem>
								<Sparkles />
								Upgrade to Pro
							</DropdownMenuItem>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							<DropdownMenuItem>
								<BadgeCheck />
								Account
							</DropdownMenuItem>
							<DropdownMenuItem>
								<CreditCard />
								Billing
							</DropdownMenuItem>
							<DropdownMenuItem>
								<Bell />
								Notifications
							</DropdownMenuItem>
						</DropdownMenuGroup>
						<DropdownMenuSeparator /> */}
						<DropdownMenuItem asChild>
							<Link to="/r6/profile">
								<ShieldCheck />
								Account &amp; Security
							</Link>
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<LogoutMenuItem />
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
