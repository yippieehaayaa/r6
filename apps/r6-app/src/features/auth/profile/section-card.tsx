import type { ReactNode } from "react";

interface SectionCardProps {
	icon: ReactNode;
	title: string;
	description: string;
	children: ReactNode;
}

export function SectionCard({
	icon,
	title,
	description,
	children,
}: SectionCardProps) {
	return (
		<div className="overflow-hidden rounded-2xl bg-surface ring-1 ring-border">
			<div className="flex items-center gap-3 border-b border-(--border) px-5 py-4">
				<div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-accent shadow-sm">
					{icon}
				</div>
				<div className="min-w-0 flex-1">
					<p className="text-sm font-semibold leading-tight text-(--text-primary)">
						{title}
					</p>
					<p className="mt-0.5 text-xs text-(--text-secondary)">
						{description}
					</p>
				</div>
			</div>
			<div className="px-5 py-5">{children}</div>
		</div>
	);
}
