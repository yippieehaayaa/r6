import { createFileRoute } from "@tanstack/react-router";
import page from "@/features/dashboard/page";

export const Route = createFileRoute("/_authenticated/")({
	component: page,
});
