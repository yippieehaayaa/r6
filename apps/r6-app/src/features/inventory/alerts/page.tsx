import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { alerts as allAlerts } from "../data/mock-data";
import type { StockAlert } from "../types";
import { AlertsTable } from "./alerts-table";

export default function AlertsPage() {
	const [alertsState, setAlertsState] = useState(allAlerts);
	const [search, setSearch] = useState("");
	const [tab, setTab] = useState("open");

	const filtered = useMemo(() => {
		switch (tab) {
			case "open":
				return alertsState.filter((a) => a.alertStatus === "OPEN");
			case "acknowledged":
				return alertsState.filter((a) => a.alertStatus === "ACKNOWLEDGED");
			case "resolved":
				return alertsState.filter((a) => a.alertStatus === "RESOLVED");
			default:
				return alertsState;
		}
	}, [alertsState, tab]);

	const handleAcknowledge = useCallback((alert: StockAlert) => {
		setAlertsState((prev) =>
			prev.map((a) =>
				a.id === alert.id
					? {
							...a,
							alertStatus: "ACKNOWLEDGED" as const,
							acknowledgedAt: new Date().toISOString(),
							acknowledgedBy: "Current User",
						}
					: a,
			),
		);
		toast.success(`Alert acknowledged for ${alert.variant.name}`);
	}, []);

	const handleResolve = useCallback((alert: StockAlert) => {
		setAlertsState((prev) =>
			prev.map((a) =>
				a.id === alert.id
					? {
							...a,
							alertStatus: "RESOLVED" as const,
							resolvedAt: new Date().toISOString(),
							resolvedBy: "Current User",
						}
					: a,
			),
		);
		toast.success(`Alert resolved for ${alert.variant.name}`);
	}, []);

	const openCount = alertsState.filter((a) => a.alertStatus === "OPEN").length;
	const ackCount = alertsState.filter(
		(a) => a.alertStatus === "ACKNOWLEDGED",
	).length;

	return (
		<div className="flex flex-1 flex-col gap-4 p-4 pt-0 animate-stagger-children">
			<div>
				<h1 className="text-xl font-semibold">Stock Alerts</h1>
				<p className="text-sm text-muted-foreground">
					Monitor and manage stock alerts across all warehouses.
				</p>
			</div>

			<Tabs value={tab} onValueChange={setTab}>
				<TabsList>
					<TabsTrigger value="open">
						Open{openCount > 0 && ` (${openCount})`}
					</TabsTrigger>
					<TabsTrigger value="acknowledged">
						Acknowledged{ackCount > 0 && ` (${ackCount})`}
					</TabsTrigger>
					<TabsTrigger value="resolved">Resolved</TabsTrigger>
					<TabsTrigger value="all">All</TabsTrigger>
				</TabsList>

				<div className="mt-4 rounded-xl border bg-card p-4">
					<TabsContent value={tab} className="mt-0">
						<AlertsTable
							data={filtered}
							filterValue={search}
							onFilterChange={setSearch}
							onAcknowledge={handleAcknowledge}
							onResolve={handleResolve}
						/>
					</TabsContent>
				</div>
			</Tabs>
		</div>
	);
}
