import { createFileRoute } from "@tanstack/react-router";
import LoginPage from "@/features/auth/login-page";

export const Route = createFileRoute("/login")({
	component: LoginPage,
});

function Login() {
	return (
		<div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
			<div className="w-full max-w-sm">
				<LoginPage />
			</div>
		</div>
	);
}
