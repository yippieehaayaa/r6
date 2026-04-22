import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";
import LoginPage from "#/features/auth/login-page";

export const Route = createFileRoute("/r6/login")({
	validateSearch: z.object({
		token: z.string().optional(),
	}),
	beforeLoad: ({ context }) => {
		if (context.auth.isAuthenticated) {
			throw redirect({ to: "/r6" });
		}
	},
	component: LoginPage,
});
