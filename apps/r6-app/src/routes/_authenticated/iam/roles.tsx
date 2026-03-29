import { createFileRoute } from "@tanstack/react-router";
import RolesPage from "@/features/iam/roles/page";

export const Route = createFileRoute("/_authenticated/iam/roles")({
	component: RolesPage,
});
