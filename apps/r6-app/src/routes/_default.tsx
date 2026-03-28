import { createFileRoute } from "@tanstack/react-router";
import { DefaultLayout } from "@/components/layouts/layout.default";

export const Route = createFileRoute("/_default")({
	component: DefaultLayout,
});
