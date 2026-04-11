import { createFileRoute } from "@tanstack/react-router";
import AlertsPage from "@/features/inventory/alerts/page";

export const Route = createFileRoute("/r6/_authenticated/inventory/alerts")({
	component: AlertsPage,
});
