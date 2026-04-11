import { useNavigate } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import {
	AlertTriangle,
	ArrowRight,
	Box,
	PackageMinus,
	PackageX,
	Warehouse,
} from "lucide-react";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
	alerts,
	getOverviewStats,
	movements,
	warehouses,
} from "../data/mock-data";
import type {
	AlertType,
	MovementType,
	StockAlert,
	StockMovement,
} from "../types";

const movementLabel: Record<MovementType, string> = {
	RECEIPT: "Receipt",
	SALE: "Sale",
	RETURN: "Return",
	ADJUSTMENT: "Adjustment",
	TRANSFER_IN: "Transfer In",
	TRANSFER_OUT: "Transfer Out",
	DAMAGE: "Damage",
	RESERVATION: "Reserved",
	RESERVATION_RELEASE: "Released",
};

const movementVariant: Record<
	MovementType,
	"default" | "secondary" | "destructive" | "outline"
> = {
	RECEIPT: "default",
	SALE: "secondary",
	RETURN: "outline",
	ADJUSTMENT: "outline",
	TRANSFER_IN: "default",
	TRANSFER_OUT: "secondary",
	DAMAGE: "destructive",
	RESERVATION: "outline",
	RESERVATION_RELEASE: "outline",
};

const alertLabel: Record<AlertType, string> = {
	LOW_STOCK: "Low Stock",
	OUT_OF_STOCK: "Out of Stock",
	OVERSTOCK: "Overstock",
	LOT_EXPIRING: "Lot Expiring",
	LOT_EXPIRED: "Lot Expired",
	COUNT_VARIANCE: "Count Variance",
};

const alertVariant: Record<
	AlertType,
	"default" | "destructive" | "outline" | "secondary"
> = {
	LOW_STOCK: "outline",
	OUT_OF_STOCK: "destructive",
	OVERSTOCK: "secondary",
	LOT_EXPIRING: "outline",
	LOT_EXPIRED: "destructive",
	COUNT_VARIANCE: "secondary",
};

function MetricCard({
	title,
	value,
	subtitle,
	icon: Icon,
	variant = "default",
}: {
	title: string;
	value: number;
	subtitle: string;
	icon: LucideIcon;
	variant?: "default" | "warning" | "danger";
}) {
	return (
		<Card>
			<CardContent className="flex items-start justify-between pt-1">
				<div className="space-y-1">
					<p className="text-sm text-muted-foreground">{title}</p>
					<p
						className={cn(
							"text-2xl font-semibold tracking-tight",
							variant === "warning" && "text-badge-low-stock",
							variant === "danger" && "text-badge-out-of-stock",
						)}
					>
						{value.toLocaleString()}
					</p>
					<p className="text-xs text-muted-foreground">{subtitle}</p>
				</div>
				<div className="rounded-xl bg-muted/60 p-2.5">
					<Icon className="h-5 w-5 text-muted-foreground" />
				</div>
			</CardContent>
		</Card>
	);
}

function MovementRow({ m }: { m: StockMovement }) {
	return (
		<div className="flex items-center gap-3 px-4 py-3">
			<div className="min-w-0 flex-1">
				<p className="truncate text-sm font-medium">{m.variant.name}</p>
				<p className="text-xs text-muted-foreground">
					{m.warehouse.name} · {m.performedByName}
				</p>
			</div>
			<Badge variant={movementVariant[m.movementType]}>
				{movementLabel[m.movementType]}
			</Badge>
			<span
				className={cn(
					"text-sm font-medium tabular-nums",
					m.quantity > 0 ? "text-badge-in-stock" : "text-badge-out-of-stock",
				)}
			>
				{m.quantity > 0 ? "+" : ""}
				{m.quantity.toLocaleString()}
			</span>
		</div>
	);
}

function AlertRow({ a }: { a: StockAlert }) {
	return (
		<div className="flex items-center gap-3 px-4 py-3">
			<div className="min-w-0 flex-1">
				<p className="truncate text-sm font-medium">{a.variant.name}</p>
				<p className="text-xs text-muted-foreground">
					{a.warehouse.name} · {new Date(a.createdAt).toLocaleDateString()}
				</p>
			</div>
			<Badge variant={alertVariant[a.alertType]}>
				{alertLabel[a.alertType]}
			</Badge>
		</div>
	);
}

export default function InventoryOverviewPage() {
	const stats = useMemo(() => getOverviewStats(), []);
	const recentMovements = useMemo(
		() =>
			[...movements]
				.sort(
					(a, b) =>
						new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
				)
				.slice(0, 6),
		[],
	);
	const openAlerts = useMemo(
		() => alerts.filter((a) => a.alertStatus !== "RESOLVED").slice(0, 5),
		[],
	);
	const navigate = useNavigate();

	return (
		<div className="flex flex-1 flex-col gap-6 p-4 pt-0 animate-stagger-children">
			<div>
				<h1 className="text-xl font-semibold">Inventory</h1>
				<p className="text-sm text-muted-foreground">
					Overview of stock levels, alerts, and recent activity.
				</p>
			</div>

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<MetricCard
					title="Total SKUs"
					value={stats.totalSkus}
					subtitle={`Across ${warehouses.length} warehouses`}
					icon={Box}
				/>
				<MetricCard
					title="Total On Hand"
					value={stats.totalOnHand}
					subtitle="Units across all locations"
					icon={Warehouse}
				/>
				<MetricCard
					title="Low Stock"
					value={stats.lowStock}
					subtitle="Variants below reorder point"
					icon={PackageMinus}
					variant="warning"
				/>
				<MetricCard
					title="Out of Stock"
					value={stats.outOfStock}
					subtitle="Variants with zero availability"
					icon={PackageX}
					variant="danger"
				/>
			</div>

			<div className="grid gap-6 lg:grid-cols-5">
				<Card className="lg:col-span-3">
					<CardHeader className="flex-row items-center justify-between border-b">
						<CardTitle>Recent Movements</CardTitle>
						<Button
							variant="ghost"
							size="sm"
							className="gap-1 text-xs"
							onClick={() => navigate({ to: "/r6/inventory/movements" })}
						>
							View all
							<ArrowRight className="h-3.5 w-3.5" />
						</Button>
					</CardHeader>
					<CardContent className="p-0">
						<div className="divide-y">
							{recentMovements.map((m) => (
								<MovementRow key={m.id} m={m} />
							))}
						</div>
					</CardContent>
				</Card>

				<Card className="lg:col-span-2">
					<CardHeader className="flex-row items-center justify-between border-b">
						<div className="flex items-center gap-2">
							<CardTitle>Active Alerts</CardTitle>
							<Badge variant="destructive">
								{openAlerts.filter((a) => a.alertStatus === "OPEN").length}
							</Badge>
						</div>
						<Button
							variant="ghost"
							size="sm"
							className="gap-1 text-xs"
							onClick={() => navigate({ to: "/r6/inventory/alerts" })}
						>
							View all
							<ArrowRight className="h-3.5 w-3.5" />
						</Button>
					</CardHeader>
					<CardContent className="p-0">
						{openAlerts.length === 0 ? (
							<div className="flex flex-col items-center gap-2 py-10 text-center">
								<AlertTriangle className="h-8 w-8 text-muted-foreground/40" />
								<p className="text-sm text-muted-foreground">
									No active alerts
								</p>
							</div>
						) : (
							<div className="divide-y">
								{openAlerts.map((a) => (
									<AlertRow key={a.id} a={a} />
								))}
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
