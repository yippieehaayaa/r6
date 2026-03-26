export const profile = {
	name: "Joshua Dave Oropilla",
	title: "Software Engineer",
	location: "Baguio City, Benguet, Philippines",
	email: "joshdave0915@gmail.com",
	emailLink: "mailto:joshdave0915@gmail.com",
	github: "https://github.com/yippieehaayaa",
	linkedin: "https://linkedin.com/in/joshua-dave-oropilla-07575123b",
	headline:
		"Full Stack Engineer building practical systems that make complex processes easier.",
	support:
		"I enjoy solving problems, discovering inefficiencies, and building maintainable software that streamlines workflows and reduces friction.",
};

export type JourneyStage = {
	id: "hero" | "profile" | "work" | "skills" | "contact" | "project";
	kicker: string;
	title: string;
	summary: string;
	progress: number;
};

export const journeyStages: JourneyStage[] = [
	{
		id: "hero",
		kicker: "Hero",
		title: profile.headline,
		summary:
			"A focused snapshot of how I build software that simplifies complex processes.",
		progress: 0.08,
	},
	{
		id: "profile",
		kicker: "Profile",
		title: "Open to Software Engineer and Full Stack Developer opportunities",
		summary:
			"I am looking for opportunities where I can solve problems, identify inefficiencies, and build maintainable systems that make work easier.",
		progress: 0.24,
	},
	{
		id: "work",
		kicker: "Work",
		title: "Work Experience",
		summary:
			"Projects where I solved practical software problems for academic operations.",
		progress: 0.4,
	},
	{
		id: "skills",
		kicker: "Skills",
		title: "Hands-on across product and platform layers",
		summary:
			"Frontend, backend, APIs, data, and deployment tooling used to keep systems fast, stable, and easy to evolve.",
		progress: 0.58,
	},
	{
		id: "contact",
		kicker: "Contact",
		title: "Let's build software that makes work easier.",
		summary:
			"If you're solving operational complexity, I can help design and ship practical systems around it.",
		progress: 0.76,
	},
	{
		id: "project",
		kicker: "Project",
		title: "Projects (Soon to Deploy)",
		summary:
			"Active projects are in progress. You can track updates and deployment progress through my GitHub and LinkedIn.",
		progress: 0.94,
	},
];

export const selectedWork = [
	{
		title: "University of Baguio",
		period: "Mar 2024 – Feb 2026",
		summary:
			"Built and improved internal systems to solve day-to-day operational issues for staff and administration.",
		tags: ["Full Stack Development", "Internal Systems", "Automation"],
	},
	{
		title: "Mapúa University",
		period: "Aug 2022 – Oct 2022",
		summary:
			"Worked on API and platform integrations that addressed academic workflow problems and reduced manual steps.",
		tags: ["API Development", "Integrations", "Academic Systems"],
	},
	{
		title: "RIA Advisory",
		period: "Aug 2023 – Nov 2023",
		summary:
			"Supported utility platform work and helped resolve configuration and data workflow issues in Oracle Utilities C2M projects.",
		tags: ["Oracle Utilities C2M", "Enterprise Systems", "Consulting"],
	},
] as const;

export type SkillIconType =
	| "api"
	| "microservices"
	| "platform"
	| "workflow"
	| "tool";

export type SkillItem = {
	name: string;
	logoSlug?: string;
	logoColor?: string;
	icon?: SkillIconType;
};

export type SkillGroup = {
	group: string;
	items: SkillItem[];
};

export const skillGroups = [
	{
		group: "Frontend",
		items: [
			{ name: "React", logoSlug: "react", logoColor: "61DAFB" },
			{ name: "TypeScript", logoSlug: "typescript", logoColor: "3178C6" },
			{ name: "JavaScript", logoSlug: "javascript", logoColor: "F7DF1E" },
			{ name: "Angular", logoSlug: "angular", logoColor: "DD0031" },
		],
	},
	{
		group: "Backend",
		items: [
			{ name: "Node.js", logoSlug: "nodedotjs", logoColor: "5FA04E" },
			{ name: "Express", logoSlug: "express", logoColor: "FFFFFF" },
			{ name: "Hono", logoSlug: "hono", logoColor: "E36002" },
			{ name: "REST APIs", icon: "api" },
			{ name: "Microservices", icon: "microservices" },
		],
	},
	{
		group: "Data",
		items: [
			{ name: "PostgreSQL", logoSlug: "postgresql", logoColor: "4169E1" },
			{ name: "MongoDB", logoSlug: "mongodb", logoColor: "47A248" },
			{ name: "Redis", logoSlug: "redis", logoColor: "FF4438" },
		],
	},
	{
		group: "DevOps / Deployment",
		items: [
			{ name: "Docker", logoSlug: "docker", logoColor: "2496ED" },
			{
				name: "GitHub Actions",
				logoSlug: "githubactions",
				logoColor: "2088FF",
			},
			{ name: "Linux", logoSlug: "linux", logoColor: "FCC624" },
			{ name: "Cloudflare", logoSlug: "cloudflare", logoColor: "F38020" },
			{ name: "Azure", logoSlug: "microsoftazure", logoColor: "0078D4" },
		],
	},
	{
		group: "Tools",
		items: [
			{ name: "Git", logoSlug: "git", logoColor: "F05032" },
			{ name: "Turborepo", logoSlug: "turborepo", logoColor: "EF4444" },
			{ name: "Bruno", logoSlug: "bruno", logoColor: "F5A524", icon: "tool" },
		],
	},
] satisfies SkillGroup[];
