import { createFileRoute } from "@tanstack/react-router";
import AccountSecurityPage from "@/features/me/page";

export const Route = createFileRoute("/_authenticated/account-security")({
	component: AccountSecurityPage,
});
