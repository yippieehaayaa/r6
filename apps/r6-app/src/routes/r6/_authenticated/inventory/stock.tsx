import { createFileRoute } from "@tanstack/react-router";
import StockOperationsPage from "@/features/inventory/stock/page";

export const Route = createFileRoute("/r6/_authenticated/inventory/stock")({
	component: StockOperationsPage,
});
