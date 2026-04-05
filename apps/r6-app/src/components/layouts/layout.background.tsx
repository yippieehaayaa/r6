import { Outlet } from "@tanstack/react-router";

export function BackgroundLayout() {
	return (
		<div className="min-h-svh w-full flex items-center justify-center">
			<Outlet />
		</div>
	);
}
