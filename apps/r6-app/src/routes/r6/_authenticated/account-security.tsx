import { createFileRoute } from "@tanstack/react-router";
import AccountSecurityPage from "@/features/me/page";

export const Route = createFileRoute("/r6/_authenticated/account-security")({
	component: AccountSecurityPage,
});
