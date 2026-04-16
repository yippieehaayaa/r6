import { createFileRoute } from "@tanstack/react-router";
import MovementsPage from "@/features/inventory/movements/page";

export const Route = createFileRoute("/r6/_authenticated/inventory/movements")({
	component: MovementsPage,
});
