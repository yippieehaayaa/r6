import { createFileRoute } from "@tanstack/react-router";
import InventoryPage from "@/features/inventory-and-catalog/inventory/page";

export const Route = createFileRoute(
	"/r6/_authenticated/inventory-and-catalog/inventory/",
)({
	component: InventoryPage,
});
