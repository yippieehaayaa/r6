import type { ReactNode } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

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
		<Card className="border-0 ring-1 ring-foreground/8 dark:ring-foreground/10">
			<CardHeader className="pb-4">
				<div className="flex items-center gap-2">
					<div className="flex size-8 items-center justify-center rounded-lg bg-foreground shadow-sm">
						{icon}
					</div>
					<div>
						<CardTitle className="text-base">{title}</CardTitle>
						<CardDescription className="text-xs">{description}</CardDescription>
					</div>
				</div>
			</CardHeader>
			<CardContent>{children}</CardContent>
		</Card>
	);
}
