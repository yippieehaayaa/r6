export const profile = {
	name: "Joshua Dave E. Oropilla",
	title: "Full Stack Software Engineer",
	location: "Philippines",
	email: "joshdave0915@gmail.com",
	emailLink: "mailto:joshdave0915@gmail.com",
	github: "https://github.com/yippieehaayaa",
	linkedin: "https://linkedin.com/in/joshua-dave-oropilla-07575123b",
	headline:
		"Full Stack Engineer building practical systems around real problems.",
	support:
		"I map friction, simplify workflows, and deliver maintainable software across frontend, backend, APIs, infrastructure, and deployment.",
};

export type JourneyStage = {
	id: "hero" | "about" | "work" | "skills" | "contact";
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
			"Scroll to drive the scene. This portfolio is a guided engineering journey, not a static resume.",
		progress: 0.04,
	},
	{
		id: "about",
		kicker: "About",
		title: "I enjoy turning process friction into clear, maintainable systems.",
		summary:
			"I look for gaps, remove repetitive steps, and shape solutions teams can keep operating with confidence.",
		progress: 0.26,
	},
	{
		id: "work",
		kicker: "Work",
		title: "Selected builds focused on practical impact",
		summary:
			"Internal platforms, workflow automation, and API engineering where reliability and speed both matter.",
		progress: 0.5,
	},
	{
		id: "skills",
		kicker: "Skills",
		title: "Comfortable across product and platform layers",
		summary:
			"Frontend, backend, APIs, data, and deployment tooling used to keep systems fast, stable, and easy to evolve.",
		progress: 0.74,
	},
	{
		id: "contact",
		kicker: "Contact",
		title: "Let's build software that makes work easier.",
		summary:
			"If you're solving operational complexity, I can help design and ship practical systems around it.",
		progress: 0.93,
	},
];

export const selectedWork = [
	{
		title: "Internal and Admin Systems",
		summary:
			"Built full-stack operational platforms that replaced scattered manual steps with clear workflows and maintainable tooling.",
		tags: ["React", "TypeScript", "Node.js", "PostgreSQL"],
	},
	{
		title: "Workflow Automation and Integrations",
		summary:
			"Automated repetitive lifecycle tasks through integration pipelines, reducing friction for teams handling high-volume processes.",
		tags: ["Automation", "Integrations", "REST APIs", "Node.js"],
	},
	{
		title: "API and Platform Engineering",
		summary:
			"Designed backend services and API layers that keep data flow predictable, observable, and easier to scale.",
		tags: ["Hono", "Express", "Microservices", "Observability"],
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
			{ name: "Vue", logoSlug: "vuedotjs", logoColor: "4FC08D" },
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
			{ name: "Bruno", logoSlug: "bruno", logoColor: "F5A524", icon: "tool" },
		],
	},
] satisfies SkillGroup[];
