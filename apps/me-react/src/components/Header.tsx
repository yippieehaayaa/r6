import { Button } from "@r6/ui";
import { Link } from "@tanstack/react-router";
import { Github, Linkedin, Mail } from "lucide-react";
import { profile } from "../content/portfolio";
import ThemeToggle from "./ThemeToggle";

const navLinks = [
	{ label: "About", href: "/#about" },
	{ label: "Work", href: "/#work" },
	{ label: "Skills", href: "/#skills" },
	{ label: "Contact", href: "/#contact" },
];

export default function Header() {
	return (
		<header className="site-header px-4">
			<div className="container-shell header-inner">
				<h2 className="m-0">
					<Link to="/" className="brand-mark">
						<span className="brand-dot" aria-hidden="true" />
						{profile.name}
					</Link>
				</h2>

				<nav aria-label="Primary navigation" className="primary-nav">
					<ul>
						{navLinks.map((item) => (
							<li key={item.label}>
								<a href={item.href} className="site-nav-link">
									{item.label}
								</a>
							</li>
						))}
					</ul>
				</nav>

				<div className="header-actions">
					<Button
						asChild
						variant="ghost"
						size="icon-sm"
						className="text-foreground"
					>
						<a href={profile.github} target="_blank" rel="noreferrer">
							<Github />
							<span className="sr-only">Open GitHub profile</span>
						</a>
					</Button>
					<Button
						asChild
						variant="ghost"
						size="icon-sm"
						className="text-foreground"
					>
						<a href={profile.linkedin} target="_blank" rel="noreferrer">
							<Linkedin />
							<span className="sr-only">Open LinkedIn profile</span>
						</a>
					</Button>
					<Button
						asChild
						variant="ghost"
						size="icon-sm"
						className="text-foreground"
					>
						<a href={profile.emailLink}>
							<Mail />
							<span className="sr-only">Send an email</span>
						</a>
					</Button>
					<ThemeToggle />
				</div>
			</div>
		</header>
	);
}
