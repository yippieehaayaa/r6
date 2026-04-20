import { createFileRoute } from "@tanstack/react-router";
import RegisterPage from "@/features/auth/register-page";

export const Route = createFileRoute("/r6/register")({
	component: RegisterPage,
});
