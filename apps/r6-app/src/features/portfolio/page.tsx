import {
	ArrowUpRightIcon,
	BriefcaseIcon,
	CodeIcon,
	GraduationCapIcon,
	MailIcon,
	ServerIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

// ─── Data ────────────────────────────────────────────────────────────────────

const skills = [
	{
		category: "Frontend",
		items: [
			"React",
			"TypeScript",
			"JavaScript",
			"TanStack Router",
			"TanStack Query",
			"TanStack Table",
		],
	},
	{
		category: "Backend",
		items: ["Node.js", "Express.js", "Hono"],
	},
	{
		category: "Architecture",
		items: ["Microservices", "Monorepo (TurboRepo)", "REST API Design"],
	},
	{
		category: "Data",
		items: ["PostgreSQL", "MongoDB", "Redis"],
	},
	{
		category: "DevOps",
		items: ["Docker", "GitHub Actions", "Linux", "Cloudflare", "Azure"],
	},
	{
		category: "Tools",
		items: ["Git", "Bruno", "TurboRepo", "Cursor", "GitHub Copilot"],
	},
];

const experience = [
	{
		title: "Founder & Software Engineer",
		company: "R6 — SaaS Platform",
		period: "Dec 2025 – Present",
		type: "Part-Time",
		bullets: [
			"Founded and developed a SaaS platform for inventory and catalog management used by local businesses.",
			"Architected a microservices-based system using a monorepo (TurboRepo) for scalability and maintainability.",
			"Built full-stack features across frontend, backend, and infrastructure layers.",
			"Deployed production-ready services using Docker, CI/CD pipelines, and cloud infrastructure.",
		],
	},
	{
		title: "Full-Stack Software Engineer",
		company: "University of Baguio",
		period: "Mar 2024 – Feb 2026",
		type: "Full-Time",
		bullets: [
			"Led end-to-end development of institutional systems, from architecture design to production deployment.",
			"Designed and implemented scalable backend services and admin dashboards supporting core operations.",
			"Built and maintained RESTful APIs optimized for performance, reliability, and maintainability.",
			"Implemented Docker-based environments and CI/CD pipelines using GitHub Actions to streamline releases.",
			"Integrated systems with Google Workspace APIs to automate user provisioning and administrative workflows.",
			"Developed a graduation management system using low-latency messaging for real-time processing.",
			"Built a centralized student database that aggregates and serves data from a legacy institutional system with no available source code or maintainer, ensuring continuity of critical data access.",
			"Engineered an automated enrollment workflow that provisions Google Workspace student accounts upon enrollment by bridging the AMS API endpoint, eliminating manual account creation.",
			"Developed an online election system for student body council voting, enforcing one-vote-per-student integrity, reducing manual workload for staff, and improving vote credibility.",
			"Administered the university's Google Workspace environment, managing account provisioning, role assignments, access controls, storage quotas, and security policies across all users.",
		],
	},
];

const projects = [
	{
		name: "R6",
		tagline: "SaaS Platform for Local Businesses",
		description:
			"A microservices-based SaaS platform for inventory and catalog management. Built on a TurboRepo monorepo with a React frontend, Hono APIs, PostgreSQL, and Redis. Deployed on cloud infrastructure with full CI/CD.",
		cta: "Access Platform",
		href: "/r6/login",
		internal: true,
	},
	{
		name: "Graduation Management System",
		tagline: "Real-Time Institutional Platform",
		description:
			"A real-time graduation processing system built for a university, leveraging low-latency messaging for live orchestration of student workflows, Google Workspace integration, and admin dashboards.",
		internal: false,
		confidential: true,
	},
	{
		name: "Centralized Student Database",
		tagline: "Legacy Data Continuity System",
		description:
			"A centralized student database that aggregates and serves data from an unmaintained legacy institutional system with no available source code, ensuring continuity of critical student data access across the university.",
		internal: false,
		confidential: true,
	},
	{
		name: "Enrollment Automation Workflow",
		tagline: "Automated Account Provisioning",
		description:
			"An automated workflow that provisions Google Workspace student accounts upon enrollment by bridging the AMS API endpoint, eliminating manual account creation and reducing administrative overhead.",
		internal: false,
		confidential: true,
	},
	{
		name: "Student Election System",
		tagline: "Secure Online Voting Platform",
		description:
			"An online election system for student body council voting that enforces one-vote-per-student integrity through secure authentication, reducing staff workload and improving the credibility and transparency of election results.",
		internal: false,
		confidential: true,
	},
];

// ─── Scroll Reveal ──────────────────────────────────────────────────────────

function useInView(threshold = 0.12) {
	const ref = useRef<HTMLDivElement>(null);
	const [inView, setInView] = useState(false);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setInView(true);
					observer.disconnect();
				}
			},
			{ threshold },
		);
		observer.observe(el);
		return () => observer.disconnect();
	}, [threshold]);

	return { ref, inView };
}

function Reveal({
	children,
	className,
	stagger,
}: {
	children: React.ReactNode;
	className?: string;
	stagger?: boolean;
}) {
	const { ref, inView } = useInView();
	return (
		<div
			ref={ref}
			className={`${inView ? (stagger ? "animate-stagger-children" : "animate-apple-enter") : "opacity-0"} ${className ?? ""}`}
		>
			{children}
		</div>
	);
}

// ─── Sections ─────────────────────────────────────────────────────────────────

function Nav() {
	return (
		<nav className="animate-apple-enter sticky top-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-xl bg-white/80 dark:bg-zinc-950/80 border-b border-zinc-200/60 dark:border-zinc-800/60">
			<span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
				Joshua Oropilla
			</span>
			<a
				href="/r6/login"
				className="flex items-center gap-1.5 rounded-full bg-zinc-900 dark:bg-zinc-100 px-4 py-1.5 text-sm font-medium text-white dark:text-zinc-900 transition-opacity hover:opacity-80"
			>
				Open R6
				<ArrowUpRightIcon className="size-3.5" />
			</a>
		</nav>
	);
}

function Hero() {
	return (
		<section className="relative flex min-h-[92dvh] flex-col items-center justify-center overflow-hidden bg-white dark:bg-zinc-950 px-6 text-center">
			{/* subtle radial gradient */}
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0 flex items-center justify-center"
			>
				<div className="h-150 w-225 rounded-full bg-linear-to-br from-blue-100/40 via-transparent to-violet-100/30 dark:from-blue-900/20 dark:to-violet-900/10 blur-3xl" />
			</div>

			<div className="animate-stagger-children relative flex flex-col items-center text-center">
				<p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
					Solution Architect · Full-Stack Developer
				</p>

				<h1 className="text-[clamp(3rem,10vw,7.5rem)] font-black leading-none tracking-tighter text-zinc-900 dark:text-zinc-50">
					Joshua
					<br />
					Oropilla
				</h1>

				<p className="mt-6 max-w-xl text-base text-zinc-500 dark:text-zinc-400 md:text-lg">
					Building scalable web systems — from microservices to polished
					frontends — with a focus on performance and clean architecture.
				</p>

				<div className="mt-10 flex flex-wrap items-center justify-center gap-3">
					<a
						href="/r6/login"
						className="flex items-center gap-2 rounded-full bg-zinc-900 dark:bg-zinc-100 px-6 py-3 text-sm font-semibold text-white dark:text-zinc-900 shadow-lg shadow-zinc-900/10 transition-transform hover:scale-[1.03] active:scale-95"
					>
						Open R6 Platform
						<ArrowUpRightIcon className="size-4" />
					</a>
					<a
						href="#about"
						className="rounded-full border border-zinc-200 dark:border-zinc-700 px-6 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900"
					>
						Learn more
					</a>
				</div>
			</div>
		</section>
	);
}

function About() {
	return (
		<section id="about" className="bg-zinc-50 dark:bg-zinc-900 py-28 px-6">
			<Reveal stagger className="mx-auto max-w-3xl">
				<Label icon={<BriefcaseIcon className="size-4" />}>About</Label>
				<h2 className="mt-4 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
					Engineering products
					<br />
					end to end.
				</h2>
				<p className="mt-6 text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
					Full-Stack Software Engineer specializing in scalable web systems
					across frontend, backend, and cloud infrastructure. Experienced in
					microservices, API design, and CI/CD, with hands-on ownership of a
					SaaS platform (R6) used by local businesses.
				</p>
			</Reveal>
		</section>
	);
}

function Skills() {
	return (
		<section className="bg-white dark:bg-zinc-950 py-28 px-6">
			<div className="mx-auto max-w-5xl">
				<Reveal stagger>
					<Label icon={<CodeIcon className="size-4" />}>Technical Skills</Label>
					<h2 className="mt-4 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
						Tools of the trade.
					</h2>
				</Reveal>
				<Reveal
					stagger
					className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
				>
					{skills.map((group) => (
						<div key={group.category}>
							<p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
								{group.category}
							</p>
							<div className="flex flex-wrap gap-2">
								{group.items.map((item) => (
									<span
										key={item}
										className="rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-3 py-1 text-sm text-zinc-700 dark:text-zinc-300"
									>
										{item}
									</span>
								))}
							</div>
						</div>
					))}
				</Reveal>
			</div>
		</section>
	);
}

function Projects() {
	return (
		<section className="bg-zinc-50 dark:bg-zinc-900 py-28 px-6">
			<div className="mx-auto max-w-5xl">
				<Reveal stagger>
					<Label icon={<ServerIcon className="size-4" />}>Projects</Label>
					<h2 className="mt-4 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
						Things I've built.
					</h2>
				</Reveal>
				<Reveal stagger className="mt-12 grid gap-6 md:grid-cols-2">
					{projects.map((project) => (
						<div
							key={project.name}
							className="group flex flex-col rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-8 transition-shadow hover:shadow-xl hover:shadow-zinc-200/60 dark:hover:shadow-zinc-900/60"
						>
							<p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
								{project.tagline}
							</p>
							<h3 className="mt-2 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
								{project.name}
							</h3>
							<p className="mt-3 grow text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
								{project.description}
							</p>
							{project.confidential && (
								<p className="mt-4 flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500">
									<span className="inline-block size-1.5 rounded-full bg-zinc-300 dark:bg-zinc-600" />
									Confidential — owned by University of Baguio. Not publicly
									accessible.
								</p>
							)}
							{project.internal && (
								<div className="mt-6">
									<a
										href={project.href}
										className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-900 dark:text-zinc-100 hover:opacity-70 transition-opacity"
									>
										{project.cta}
										<ArrowUpRightIcon className="size-4" />
									</a>
								</div>
							)}
						</div>
					))}
				</Reveal>
			</div>
		</section>
	);
}

function Experience() {
	return (
		<section className="bg-white dark:bg-zinc-950 py-28 px-6">
			<div className="mx-auto max-w-3xl">
				<Reveal stagger>
					<Label icon={<BriefcaseIcon className="size-4" />}>Experience</Label>
					<h2 className="mt-4 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
						Where I've worked.
					</h2>
				</Reveal>
				<Reveal stagger className="mt-12 flex flex-col gap-12">
					{experience.map((job) => (
						<div
							key={`${job.title}-${job.company}`}
							className="relative pl-6 border-l border-zinc-200 dark:border-zinc-800"
						>
							<div className="absolute -left-1.5 top-1 size-3 rounded-full bg-zinc-900 dark:bg-zinc-100" />
							<div className="flex flex-wrap items-baseline gap-2">
								<span className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
									{job.period}
								</span>
								<span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
									{job.type}
								</span>
							</div>
							<h3 className="mt-1 text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
								{job.title}
							</h3>
							<p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
								{job.company}
							</p>
							<ul className="mt-4 flex flex-col gap-2">
								{job.bullets.map((b) => (
									<li
										key={b}
										className="flex gap-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400"
									>
										<span className="mt-2 size-1 shrink-0 rounded-full bg-zinc-400" />
										{b}
									</li>
								))}
							</ul>
						</div>
					))}
				</Reveal>
			</div>
		</section>
	);
}

function Education() {
	return (
		<section className="bg-zinc-50 dark:bg-zinc-900 py-28 px-6">
			<div className="mx-auto max-w-3xl">
				<Reveal stagger>
					<Label icon={<GraduationCapIcon className="size-4" />}>
						Education
					</Label>
					<h2 className="mt-4 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
						Academic background.
					</h2>
				</Reveal>
				<Reveal className="mt-12 relative pl-6 border-l border-zinc-200 dark:border-zinc-800">
					<div className="absolute -left-1.5 top-1 size-3 rounded-full bg-zinc-900 dark:bg-zinc-100" />
					<span className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
						2018 – 2023
					</span>
					<h3 className="mt-1 text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
						Bachelor of Science in Computer Science
					</h3>
					<p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
						Mapúa University
					</p>
				</Reveal>
			</div>
		</section>
	);
}

function Contact() {
	return (
		<section className="bg-white dark:bg-zinc-950 py-28 px-6">
			<Reveal stagger className="mx-auto max-w-3xl text-center">
				<Label icon={<MailIcon className="size-4" />} centered>
					Contact
				</Label>
				<h2 className="mt-4 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
					Let's work together.
				</h2>
				<p className="mt-6 text-lg text-zinc-500 dark:text-zinc-400">
					Available for freelance work, contract roles, and interesting
					collaborations.
				</p>
				<div className="mt-10 flex flex-wrap justify-center gap-4">
					<a
						href="https://github.com/yippieehaayaa"
						target="_blank"
						rel="noreferrer"
						className="flex items-center gap-2 rounded-full border border-zinc-200 dark:border-zinc-700 px-6 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900"
					>
						GitHub
						<ArrowUpRightIcon className="size-3.5" />
					</a>
					<a
						href="https://www.linkedin.com/in/joshua-dave-oropilla-07575123b/"
						target="_blank"
						rel="noreferrer"
						className="flex items-center gap-2 rounded-full border border-zinc-200 dark:border-zinc-700 px-6 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900"
					>
						LinkedIn
						<ArrowUpRightIcon className="size-3.5" />
					</a>
					<a
						href="/r6/login"
						className="flex items-center gap-2 rounded-full bg-zinc-900 dark:bg-zinc-100 px-6 py-3 text-sm font-semibold text-white dark:text-zinc-900 transition-opacity hover:opacity-80"
					>
						Open R6 Platform
						<ArrowUpRightIcon className="size-4" />
					</a>
				</div>
			</Reveal>
		</section>
	);
}

function Footer() {
	return (
		<footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-6 py-8">
			<div className="mx-auto flex max-w-5xl items-center justify-between text-xs text-zinc-400 dark:text-zinc-500">
				<span>© {new Date().getFullYear()} Joshua Oropilla</span>
				<a
					href="/r6/login"
					className="flex items-center gap-1 transition-colors hover:text-zinc-700 dark:hover:text-zinc-300"
				>
					R6 Platform
					<ArrowUpRightIcon className="size-3" />
				</a>
			</div>
		</footer>
	);
}

// ─── Shared ───────────────────────────────────────────────────────────────────

function Label({
	icon,
	children,
	centered,
}: {
	icon: React.ReactNode;
	children: React.ReactNode;
	centered?: boolean;
}) {
	return (
		<div
			className={`flex items-center gap-2 text-sm font-semibold text-zinc-500 dark:text-zinc-400 ${centered ? "justify-center" : ""}`}
		>
			{icon}
			{children}
		</div>
	);
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PortfolioPage() {
	return (
		<div className="min-h-dvh font-sans antialiased">
			<Nav />
			<main>
				<Hero />
				<About />
				<Skills />
				<Projects />
				<Experience />
				<Education />
				<Contact />
			</main>
			<Footer />
		</div>
	);
}
