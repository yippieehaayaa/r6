import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	Outlet,
	useNavigate,
} from "@tanstack/react-router";
import React, { useEffect } from "react";
import { toast } from "sonner";
import { onSessionExpired } from "@/api/session-events";
import { type AuthContext, useAuth } from "@/auth";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

const TanStackQueryDevtools =
	process.env.NODE_ENV === "production"
		? () => null
		: React.lazy(() =>
				import(
					"@tanstack/react-query-devtools/build/modern/production.js"
				).then((d) => ({
					default: d.ReactQueryDevtools,
				})),
			);

const TanStackRouterDevtools =
	process.env.NODE_ENV === "production"
		? () => null
		: React.lazy(() =>
				import("@tanstack/react-router-devtools").then((res) => ({
					default: res.TanStackRouterDevtools,
				})),
			);

export const Route = createRootRouteWithContext<{
	queryClient: QueryClient;
	auth: AuthContext;
}>()({
	head: () => {
		return {
			meta: [
				{
					title: "Home",
				},
			],
		};
	},
	component: Root,
});

function SessionExpiredListener() {
	const { logout } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		return onSessionExpired(async () => {
			await logout();
			toast.error("Session expired. Please sign in again.");
			navigate({ to: "/r6/login", replace: true });
		});
	}, [logout, navigate]);

	return null;
}

function Root() {
	return (
		<ThemeProvider defaultTheme="system" storageKey="r6-ui-theme">
			<TooltipProvider>
				<SessionExpiredListener />
				<Outlet />
				<Toaster />
				<React.Suspense>
					<TanStackQueryDevtools />
					<TanStackRouterDevtools />
				</React.Suspense>
			</TooltipProvider>
		</ThemeProvider>
	);
}
