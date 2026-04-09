import { createFileRoute } from "@tanstack/react-router";
import MovementsPage from "@/features/inventory-and-catalog/movements/page";

export const Route = createFileRoute(
	"/r6/_authenticated/inventory-and-catalog/movements/",
)({
	component: MovementsPage,
});
