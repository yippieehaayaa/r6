import { createFileRoute } from "@tanstack/react-router";
import InventoryOverviewPage from "@/features/inventory/overview/page";

export const Route = createFileRoute("/r6/_authenticated/inventory/")({
	component: InventoryOverviewPage,
});
