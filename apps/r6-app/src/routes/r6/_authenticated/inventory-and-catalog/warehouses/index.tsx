import { createFileRoute } from "@tanstack/react-router";
import WarehousesPage from "@/features/inventory-and-catalog/warehouses/page";

export const Route = createFileRoute(
	"/r6/_authenticated/inventory-and-catalog/warehouses/",
)({
	component: WarehousesPage,
});
