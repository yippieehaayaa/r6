import { createFileRoute } from "@tanstack/react-router";
import ProfilePage from "@/features/auth/profile/page";

export const Route = createFileRoute("/r6/_authenticated/profile")({
	component: ProfilePage,
});
