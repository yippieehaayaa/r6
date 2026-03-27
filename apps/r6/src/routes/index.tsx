import {
	Badge,
	Button,
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	Input,
	Separator,
	Switch,
} from "@r6/ui";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({
	component: StylesShowcase,
});

const tokens = [
	{
		name: "--bg",
		label: "Background",
		light: "#DEDEDE",
		dark: "#111111",
		utility: "bg-[var(--bg)]",
	},
	{
		name: "--surface",
		label: "Surface",
		light: "#FFFFFF",
		dark: "#0D0D0D",
		utility: "bg-surface",
	},
	{
		name: "--border",
		label: "Border",
		light: "#D4D4D4",
		dark: "#2A2A2A",
		utility: "border-default",
	},
	{
		name: "--text-primary",
		label: "Text Primary",
		light: "#111111",
		dark: "#E3E3E3",
		utility: "text-[var(--text-primary)]",
	},
	{
		name: "--text-secondary",
		label: "Text Secondary",
		light: "#525252",
		dark: "#A1A1A1",
		utility: "text-secondary",
	},
	{
		name: "--accent",
		label: "Accent",
		light: "#3B82F6",
		dark: "#3B82F6",
		utility: "accent",
	},
];

function ColorSwatch({
	token,
	isDark,
}: {
	token: (typeof tokens)[number];
	isDark: boolean;
}) {
	const value = isDark ? token.dark : token.light;

	return (
		<div className="flex items-center gap-4">
			<div
				className="size-10 shrink-0 rounded-lg border border-default"
				style={{ backgroundColor: value }}
			/>
			<div className="min-w-0 flex-1">
				<p
					className="font-mono text-sm font-medium"
					style={{ color: "var(--text-primary)" }}
				>
					{token.name}
				</p>
				<p className="text-secondary font-mono text-xs">{value}</p>
			</div>
			<Badge variant="outline" className="shrink-0 font-mono text-xs">
				{token.utility}
			</Badge>
		</div>
	);
}

function Section({
	title,
	description,
	children,
}: {
	title: string;
	description?: string;
	children: React.ReactNode;
}) {
	return (
		<section className="flex flex-col gap-4">
			<div>
				<h2
					className="text-base font-semibold"
					style={{ color: "var(--text-primary)" }}
				>
					{title}
				</h2>
				{description && (
					<p className="text-secondary mt-0.5 text-sm">{description}</p>
				)}
			</div>
			{children}
		</section>
	);
}

function StylesShowcase() {
	const [isDark, setIsDark] = useState(false);

	useEffect(() => {
		const root = document.documentElement;
		if (isDark) {
			root.classList.add("dark");
		} else {
			root.classList.remove("dark");
		}
	}, [isDark]);

	return (
		<div
			className="min-h-svh px-6 py-12 transition-colors duration-200"
			style={{ backgroundColor: "var(--bg)" }}
		>
			<div className="mx-auto w-full max-w-2xl space-y-12">
				{/* Header */}
				<div className="flex items-start justify-between gap-4">
					<div>
						<h1
							className="text-2xl font-semibold tracking-tight"
							style={{ color: "var(--text-primary)" }}
						>
							styles.css
						</h1>
						<p className="text-secondary mt-1 text-sm">
							Design token & utility class showcase
						</p>
					</div>
					<div className="flex items-center gap-2 pt-1">
						<span className="text-secondary text-sm">Light</span>
						<Switch
							checked={isDark}
							onCheckedChange={setIsDark}
							aria-label="Toggle dark mode"
						/>
						<span className="text-secondary text-sm">Dark</span>
					</div>
				</div>

				<Separator />

				{/* Color Tokens */}
				<Section
					title="Color Tokens"
					description="CSS variables defined in :root (light) and .dark. Each token maps to a utility class."
				>
					<Card>
						<CardContent className="flex flex-col gap-4 pt-4">
							{tokens.map((token, i) => (
								<div key={token.name}>
									<ColorSwatch token={token} isDark={isDark} />
									{i < tokens.length - 1 && <Separator className="mt-4" />}
								</div>
							))}
						</CardContent>
					</Card>
				</Section>

				{/* Utility Classes */}
				<Section
					title="Utility Classes"
					description="Custom @utility classes registered with Tailwind v4."
				>
					<div className="grid gap-3">
						<Card>
							<CardHeader>
								<CardTitle className="font-mono text-sm">.bg-surface</CardTitle>
								<CardDescription>
									background-color: var(--surface)
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="bg-surface rounded-lg p-4 border border-default">
									<p
										className="text-sm"
										style={{ color: "var(--text-primary)" }}
									>
										This element uses{" "}
										<code className="font-mono text-xs bg-black/10 dark:bg-white/10 px-1 rounded">
											bg-surface
										</code>
									</p>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className="font-mono text-sm">
									.border-default
								</CardTitle>
								<CardDescription>border-color: var(--border)</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="border-2 border-default rounded-lg p-4">
									<p
										className="text-sm"
										style={{ color: "var(--text-primary)" }}
									>
										This element uses{" "}
										<code className="font-mono text-xs bg-black/10 dark:bg-white/10 px-1 rounded">
											border-default
										</code>
									</p>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className="font-mono text-sm">
									.text-secondary
								</CardTitle>
								<CardDescription>color: var(--text-secondary)</CardDescription>
							</CardHeader>
							<CardContent>
								<p className="text-secondary text-sm">
									This paragraph uses{" "}
									<code className="font-mono text-xs bg-black/10 dark:bg-white/10 px-1 rounded">
										text-secondary
									</code>{" "}
									for subdued text.
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle className="font-mono text-sm">.accent</CardTitle>
								<CardDescription>color: var(--accent)</CardDescription>
							</CardHeader>
							<CardContent>
								<p className="text-sm" style={{ color: "var(--text-primary)" }}>
									Use <span className="accent font-semibold">.accent</span> for
									highlighted or interactive text elements.
								</p>
							</CardContent>
						</Card>
					</div>
				</Section>

				{/* Typography */}
				<Section
					title="Typography"
					description="Apple system font stack applied globally via body."
				>
					<Card>
						<CardContent className="flex flex-col gap-3 pt-4">
							<p
								className="text-2xl font-semibold"
								style={{ color: "var(--text-primary)" }}
							>
								The quick brown fox
							</p>
							<p className="text-base" style={{ color: "var(--text-primary)" }}>
								Regular body text at base size.
							</p>
							<p className="text-secondary text-sm">
								Secondary text — muted, smaller, less prominent.
							</p>
							<p
								className="font-mono text-sm"
								style={{ color: "var(--text-primary)" }}
							>
								-apple-system, BlinkMacSystemFont, "San Francisco"
							</p>
						</CardContent>
					</Card>
				</Section>

				{/* Components using tokens */}
				<Section
					title="Components"
					description="Shared UI components rendered against the current theme."
				>
					<div className="flex flex-col gap-4">
						{/* Buttons */}
						<Card>
							<CardHeader>
								<CardTitle>Buttons</CardTitle>
							</CardHeader>
							<CardContent className="flex flex-wrap gap-2">
								<Button variant="default">Default</Button>
								<Button variant="secondary">Secondary</Button>
								<Button variant="outline">Outline</Button>
								<Button variant="ghost">Ghost</Button>
								<Button variant="destructive">Destructive</Button>
								<Button variant="link">Link</Button>
							</CardContent>
						</Card>

						{/* Badges */}
						<Card>
							<CardHeader>
								<CardTitle>Badges</CardTitle>
							</CardHeader>
							<CardContent className="flex flex-wrap gap-2">
								<Badge variant="default">Default</Badge>
								<Badge variant="secondary">Secondary</Badge>
								<Badge variant="outline">Outline</Badge>
								<Badge variant="destructive">Destructive</Badge>
								<Badge variant="ghost">Ghost</Badge>
							</CardContent>
						</Card>

						{/* Input */}
						<Card>
							<CardHeader>
								<CardTitle>Input</CardTitle>
							</CardHeader>
							<CardContent>
								<Input placeholder="Type something..." />
							</CardContent>
						</Card>
					</div>
				</Section>

				{/* Theme transition note */}
				<Separator />
				<p className="text-secondary text-center text-xs">
					Toggle the switch above to preview both themes. Transitions are
					animated via{" "}
					<code className="font-mono">
						transition: background-color 0.2s ease, color 0.2s ease
					</code>
					.
				</p>
			</div>
		</div>
	);
}
