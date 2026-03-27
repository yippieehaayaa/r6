import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import React from "react";

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
		<>
			<Outlet />
			<React.Suspense>
				<TanStackQueryDevtools />
				<TanStackRouterDevtools />
			</React.Suspense>
		</>
	);
}
