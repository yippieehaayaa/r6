import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";
import RegisterPage from "#/features/auth/register/page";

export const Route = createFileRoute("/r6/register")({
	validateSearch: z.object({
		token: z.string().optional(),
	}),
	beforeLoad: ({ context }) => {
		if (context.auth.isAuthenticated) {
			throw redirect({ to: "/r6" });
		}
	},
	component: RegisterPage,
});
