import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";
import AcceptInvitationPage from "#/features/auth/accept-invitation/page";

export const Route = createFileRoute("/r6/accept-invitation")({
	validateSearch: z.object({
		token: z.string().min(1).catch(""),
	}),
	beforeLoad: ({ context }) => {
		if (context.auth.isAuthenticated) {
			throw redirect({ to: "/r6" });
		}
	},
	component: AcceptInvitationPage,
});
