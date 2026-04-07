import { createFileRoute } from "@tanstack/react-router";
import page from "@/features/dashboard/page";

export const Route = createFileRoute("/r6/_authenticated/")({
	component: page,
});
