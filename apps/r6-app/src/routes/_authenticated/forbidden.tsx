import { createFileRoute } from "@tanstack/react-router";
import ForbiddenPage from "@/features/forbidden/page";

export const Route = createFileRoute("/_authenticated/forbidden")({
	component: ForbiddenPage,
});
