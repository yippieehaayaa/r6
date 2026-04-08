import { createFileRoute } from "@tanstack/react-router";
import ForbiddenPage from "@/features/forbidden/page";

export const Route = createFileRoute("/r6/_authenticated/forbidden")({
	component: ForbiddenPage,
});
