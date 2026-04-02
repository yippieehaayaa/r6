import { Link } from "@tanstack/react-router";
import { ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ForbiddenPage() {
	return (
		<div className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
			<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
				<ShieldOff className="h-8 w-8 text-muted-foreground" />
			</div>
			<div className="flex flex-col gap-2">
				<h1 className="text-2xl font-semibold tracking-tight">Access Denied</h1>
				<p className="max-w-sm text-sm text-muted-foreground">
					You don't have permission to view this page. Contact your
					administrator if you think this is a mistake.
				</p>
			</div>
			<div className="flex items-center gap-3">
				<Button variant="outline" asChild>
					<Link to="..">Go Back</Link>
				</Button>
				<Button asChild>
					<Link to="/">Go to Dashboard</Link>
				</Button>
			</div>
		</div>
	);
}
