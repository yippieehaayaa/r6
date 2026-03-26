import { Button } from "@r6/ui";
import { Laptop, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

type ThemeMode = "light" | "dark" | "auto";

function getInitialMode(): ThemeMode {
	if (typeof window === "undefined") {
		return "dark";
	}

	const stored = window.localStorage.getItem("theme");
	if (stored === "light" || stored === "dark" || stored === "auto") {
		return stored;
	}

	return "dark";
}

function applyThemeMode(mode: ThemeMode) {
	const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
	const resolved = mode === "auto" ? (prefersDark ? "dark" : "light") : mode;

	document.documentElement.classList.remove("light", "dark");
	document.documentElement.classList.add(resolved);

	if (mode === "auto") {
		document.documentElement.removeAttribute("data-theme");
	} else {
		document.documentElement.setAttribute("data-theme", mode);
	}

	document.documentElement.style.colorScheme = resolved;
}

export default function ThemeToggle() {
	const [mode, setMode] = useState<ThemeMode>("dark");

	useEffect(() => {
		const initialMode = getInitialMode();
		setMode(initialMode);
		applyThemeMode(initialMode);
	}, []);

	useEffect(() => {
		if (mode !== "auto") {
			return;
		}

		const media = window.matchMedia("(prefers-color-scheme: dark)");
		const onChange = () => applyThemeMode("auto");

		media.addEventListener("change", onChange);
		return () => {
			media.removeEventListener("change", onChange);
		};
	}, [mode]);

	function toggleMode() {
		const nextMode: ThemeMode =
			mode === "dark" ? "light" : mode === "light" ? "auto" : "dark";
		setMode(nextMode);
		applyThemeMode(nextMode);
		window.localStorage.setItem("theme", nextMode);
	}

	const labelMap: Record<ThemeMode, string> = {
		auto: "Theme mode: auto. Click to switch to dark mode.",
		dark: "Theme mode: dark. Click to switch to light mode.",
		light: "Theme mode: light. Click to switch to auto mode.",
	};

	return (
		<Button
			type="button"
			onClick={toggleMode}
			aria-label={labelMap[mode]}
			title={labelMap[mode]}
			variant="outline"
			size="sm"
			className="min-w-20"
		>
			{mode === "dark" ? (
				<>
					<Moon className="size-3.5" />
					Dark
				</>
			) : mode === "light" ? (
				<>
					<Sun className="size-3.5" />
					Light
				</>
			) : (
				<>
					<Laptop className="size-3.5" />
					Auto
				</>
			)}
		</Button>
	);
}
