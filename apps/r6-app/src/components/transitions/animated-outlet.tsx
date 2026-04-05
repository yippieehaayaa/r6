import { Outlet, useRouterState } from "@tanstack/react-router";

export function AnimatedOutlet() {
	const pathname = useRouterState({ select: (s) => s.location.pathname });

	return (
		<div
			key={pathname}
			className="animate-page-enter w-full flex flex-1 flex-col"
		>
			<Outlet />
		</div>
	);
}
