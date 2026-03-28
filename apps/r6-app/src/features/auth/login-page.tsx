import { Link } from "@tanstack/react-router";
import { GalleryVerticalEnd } from "lucide-react";

import { LoginForm } from "@/components/login-form";
import { ModeToggle } from "@/components/mode-toggle";

export default function LoginPage() {
	return (
		<div className="relative flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
			<div className="absolute top-4 right-4">
				<ModeToggle />
			</div>
			<div className="flex w-full max-w-sm flex-col gap-6">
				<Link
					to="/login"
					className="flex items-center gap-2 self-center font-medium text-[var(--text-primary)]"
				>
					<div className="flex size-6 items-center justify-center rounded-md bg-[var(--accent)] text-white">
						<GalleryVerticalEnd className="size-4" />
					</div>
					R6 Inc.
				</Link>
				<LoginForm />
			</div>
		</div>
	);
}
