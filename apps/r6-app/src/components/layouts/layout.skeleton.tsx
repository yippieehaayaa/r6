import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarInset,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSkeleton,
	SidebarProvider,
	SidebarRail,
	SidebarSeparator,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

function SkeletonSidebar() {
	return (
		<Sidebar collapsible="icon">
			{/* Header — team/logo block */}
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg" disabled>
							<Skeleton className="flex aspect-square size-8 rounded-lg" />
							<div className="grid flex-1 gap-1">
								<Skeleton className="h-3.5 w-24" />
								<Skeleton className="h-3 w-16" />
							</div>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>

			{/* Content — nav groups */}
			<SidebarContent>
				<SidebarMenu>
					{Array.from({ length: 5 }).map((_, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton rows
						<SidebarMenuItem key={i}>
							<SidebarMenuSkeleton showIcon />
						</SidebarMenuItem>
					))}
				</SidebarMenu>

				<SidebarSeparator />

				<SidebarMenu>
					{Array.from({ length: 3 }).map((_, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton rows
						<SidebarMenuItem key={i}>
							<SidebarMenuSkeleton showIcon />
						</SidebarMenuItem>
					))}
				</SidebarMenu>
			</SidebarContent>

			{/* Footer — user block */}
			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg" disabled>
							<Skeleton className="size-8 rounded-lg" />
							<div className="grid flex-1 gap-1">
								<Skeleton className="h-3.5 w-20" />
								<Skeleton className="h-3 w-28" />
							</div>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>

			<SidebarRail />
		</Sidebar>
	);
}

function SkeletonHeader() {
	return (
		<header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
			<div className="flex flex-1 items-center gap-2 px-4">
				{/* SidebarTrigger placeholder */}
				<Skeleton className="size-7 rounded-md" />
				<div className="w-px h-4 bg-border shrink-0" />
				{/* Breadcrumb placeholder */}
				<Skeleton className="h-4 w-24 rounded-md" />
				{/* ModeToggle placeholder */}
				<Skeleton className="ml-auto size-9 rounded-md" />
			</div>
		</header>
	);
}

function SkeletonContent() {
	return (
		<div className="flex flex-1 flex-col gap-6 p-6">
			{/* Page title + subtitle */}
			<div className="flex flex-col gap-2">
				<Skeleton className="h-8 w-48 rounded-md" />
				<Skeleton className="h-4 w-72 rounded-md" />
			</div>

			{/* Card grid */}
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{Array.from({ length: 3 }).map((_, i) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton cards
					<Skeleton key={i} className="h-32 w-full rounded-xl" />
				))}
			</div>

			{/* Table-like rows */}
			<div className="flex flex-col gap-3">
				{Array.from({ length: 5 }).map((_, i) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton rows
					<Skeleton key={i} className="h-10 w-full rounded-md" />
				))}
			</div>
		</div>
	);
}

export function LayoutSkeleton() {
	return (
		<SidebarProvider>
			<SkeletonSidebar />
			<SidebarInset>
				<SkeletonHeader />
				<SkeletonContent />
			</SidebarInset>
		</SidebarProvider>
	);
}
