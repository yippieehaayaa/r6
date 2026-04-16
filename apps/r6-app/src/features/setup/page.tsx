import { useNavigate } from "@tanstack/react-router";
import { GalleryVerticalEnd } from "lucide-react";
import { useSetupStatusQuery } from "@/api/inventory/setup/queries/setup-status";
import { useAuth } from "@/auth";
import { ModeToggle } from "@/components/mode-toggle";
import { SetupWizard } from "./wizard";

export default function SetupPage() {
	const { claims } = useAuth();
	const navigate = useNavigate();
	const tenantSlug = claims?.tenantSlug ?? "";

	const { data: status, isPending } = useSetupStatusQuery(tenantSlug, {
		staleTime: 0,
	});

	function onComplete() {
		navigate({ to: "/r6" });
	}

	return (
		<div className="animate-apple-enter min-h-svh bg-muted flex flex-col">
			<header className="flex items-center justify-between px-6 py-4 shrink-0">
				<div className="flex items-center gap-2 font-medium text-(--text-primary)">
					<div className="flex size-6 items-center justify-center rounded-md bg-accent text-white">
						<GalleryVerticalEnd className="size-4" />
					</div>
					R6 Inc.
				</div>
				<ModeToggle />
			</header>
			<div className="flex flex-1 items-start justify-center p-4 pb-8 md:items-center">
				{isPending ? (
					<div className="flex flex-col items-center gap-3 text-muted-foreground">
						<div className="size-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
						<span className="text-sm">Loading setup status…</span>
					</div>
				) : status ? (
					<SetupWizard
						tenantSlug={tenantSlug}
						status={status}
						onComplete={onComplete}
					/>
				) : null}
			</div>
		</div>
	);
}
