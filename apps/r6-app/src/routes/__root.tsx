import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import React from "react";
import type { AuthContext } from "@/auth";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
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

function Root() {
	return (
		<ThemeProvider defaultTheme="system" storageKey="r6-ui-theme">
			<TooltipProvider>
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
