import { Badge, Button, Progress, Separator } from "@r6/ui";
import { createFileRoute } from "@tanstack/react-router";
import { Github, Linkedin, Mail } from "lucide-react";
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import SkillPill from "../components/SkillPill";
import {
	type JourneyStage,
	journeyStages,
	profile,
	selectedWork,
	skillGroups,
} from "../content/portfolio";

const ScrollJourneyScene = lazy(
	() => import("../components/ScrollJourneyScene"),
);

const sceneProgressStart = journeyStages[0]?.progress ?? 0;
const sceneProgressEnd = journeyStages.at(-1)?.progress ?? 1;
const sceneProgressSpan = Math.max(
	sceneProgressEnd - sceneProgressStart,
	0.001,
);

function clamp(value: number, min = 0, max = 1) {
	return Math.min(Math.max(value, min), max);
}

function nearestStage(progress: number) {
	return journeyStages.reduce(
		(best, stage) => {
			const distance = Math.abs(progress - stage.progress);
			if (distance < best.distance) {
				return { stage, distance };
			}
			return best;
		},
		{ stage: journeyStages[0], distance: Number.POSITIVE_INFINITY },
	).stage;
}

function createStageRefs() {
	return journeyStages.reduce(
		(collection, stage) => {
			collection[stage.id] = null;
			return collection;
		},
		{} as Record<JourneyStage["id"], HTMLElement | null>,
	);
}

function createInitialRevealState() {
	return journeyStages.reduce(
		(collection, stage, index) => {
			collection[stage.id] = index === 0;
			return collection;
		},
		{} as Record<JourneyStage["id"], boolean>,
	);
}

export const Route = createFileRoute("/")({
	head: () => ({
		meta: [
			{
				title: "Joshua Dave Oropilla | Full Stack Engineer",
			},
			{
				name: "description",
				content:
					"Interactive portfolio of Joshua Dave Oropilla, a Full Stack Engineer building practical systems that make complex processes easier.",
			},
		],
	}),
	component: PortfolioJourneyPage,
});

function PortfolioJourneyPage() {
	const shellRef = useRef<HTMLElement | null>(null);
	const stageRefs = useRef<Record<JourneyStage["id"], HTMLElement | null>>(
		createStageRefs(),
	);
	const [progress, setProgress] = useState(sceneProgressStart);
	const [revealedStages, setRevealedStages] = useState<
		Record<JourneyStage["id"], boolean>
	>(createInitialRevealState);

	useEffect(() => {
		let frame = 0;

		const measureProgress = () => {
			const shell = shellRef.current;
			if (!shell) {
				return;
			}

			const shellTop = shell.getBoundingClientRect().top;
			const maxScrollable = Math.max(
				shell.scrollHeight - window.innerHeight,
				1,
			);
			const ratio = clamp(-shellTop / maxScrollable);
			const mappedProgress = sceneProgressStart + ratio * sceneProgressSpan;

			setProgress((current) =>
				Math.abs(current - mappedProgress) > 0.0006 ? mappedProgress : current,
			);
		};

		const queueMeasure = () => {
			if (frame !== 0) {
				return;
			}

			frame = window.requestAnimationFrame(() => {
				frame = 0;
				measureProgress();
			});
		};

		measureProgress();
		window.addEventListener("scroll", queueMeasure, { passive: true });
		window.addEventListener("resize", queueMeasure);

		return () => {
			window.cancelAnimationFrame(frame);
			window.removeEventListener("scroll", queueMeasure);
			window.removeEventListener("resize", queueMeasure);
		};
	}, []);

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				setRevealedStages((current) => {
					let changed = false;
					const next = { ...current };

					for (const entry of entries) {
						if (!entry.isIntersecting) {
							continue;
						}

						const id = entry.target.getAttribute("data-stage-id") as
							| JourneyStage["id"]
							| null;
						if (!id || next[id]) {
							continue;
						}

						next[id] = true;
						changed = true;
					}

					return changed ? next : current;
				});
			},
			{
				threshold: 0.35,
				rootMargin: "-12% 0px -14% 0px",
			},
		);

		for (const stage of journeyStages) {
			const element = stageRefs.current[stage.id];
			if (element) {
				observer.observe(element);
			}
		}

		return () => observer.disconnect();
	}, []);

	const activeStage = useMemo(() => nearestStage(progress), [progress]);
	const completion = useMemo(
		() => clamp((progress - sceneProgressStart) / sceneProgressSpan),
		[progress],
	);

	const goToStage = (stageId: JourneyStage["id"]) => {
		const target = stageRefs.current[stageId];
		target?.scrollIntoView({ behavior: "smooth", block: "center" });
	};

	useEffect(() => {
		const shouldIgnoreKey = (target: EventTarget | null) => {
			if (!(target instanceof HTMLElement)) {
				return false;
			}

			const tagName = target.tagName.toLowerCase();
			return (
				tagName === "input" ||
				tagName === "textarea" ||
				tagName === "select" ||
				target.isContentEditable
			);
		};

		const onKeyDown = (event: KeyboardEvent) => {
			if (shouldIgnoreKey(event.target)) {
				return;
			}

			if (event.key !== "ArrowDown" && event.key !== "ArrowUp") {
				return;
			}

			event.preventDefault();
			const currentIndex = journeyStages.findIndex(
				(stage) => stage.id === activeStage.id,
			);
			if (currentIndex === -1) {
				return;
			}

			const targetIndex =
				event.key === "ArrowDown"
					? Math.min(currentIndex + 1, journeyStages.length - 1)
					: Math.max(currentIndex - 1, 0);
			const targetStage = journeyStages[targetIndex];
			if (!targetStage) {
				return;
			}

			stageRefs.current[targetStage.id]?.scrollIntoView({
				behavior: "smooth",
				block: "center",
			});
		};

		window.addEventListener("keydown", onKeyDown, { passive: false });
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [activeStage.id]);

	return (
		<main id="main-content" className="journey-main">
			<h1 className="sr-only">
				Interactive portfolio of {profile.name}, Full Stack Engineer
			</h1>

			<section
				ref={shellRef}
				className="journey-shell"
				aria-label="Immersive engineering portfolio experience"
			>
				<div className="journey-sticky">
					<Suspense fallback={<div className="journey-scene-loading" />}>
						<ScrollJourneyScene progress={progress} />
					</Suspense>
					<div className="journey-scene-scrim" aria-hidden="true" />

					<div className="journey-chrome" aria-hidden="true">
						<p className="journey-chrome-name">{profile.name}</p>
					</div>

					<div className="journey-social-links">
						<a
							href={profile.github}
							target="_blank"
							rel="noreferrer"
							aria-label="Open GitHub profile"
						>
							<Github className="size-4" />
						</a>
						<a
							href={profile.linkedin}
							target="_blank"
							rel="noreferrer"
							aria-label="Open LinkedIn profile"
						>
							<Linkedin className="size-4" />
						</a>
					</div>

					<div className="journey-indicator" aria-live="polite">
						<p className="journey-indicator-label">{activeStage.kicker}</p>
						<Progress
							value={completion * 100}
							className="journey-indicator-progress"
						/>
						<div className="journey-indicator-stops">
							{journeyStages.map((stage) => (
								<button
									type="button"
									key={stage.id}
									className="journey-indicator-stop"
									data-active={stage.id === activeStage.id}
									onClick={() => goToStage(stage.id)}
								>
									{stage.kicker}
								</button>
							))}
						</div>
						<p className="journey-nav-hint">
							Scroll down or press Arrow Down to move forward. Scroll up or
							press Arrow Up to move backward. You can also click a section
							label.
						</p>
					</div>
				</div>

				<div className="journey-scroll-track">
					{journeyStages.map((stage, index) => (
						<section
							key={stage.id}
							id={stage.id}
							ref={(element) => {
								stageRefs.current[stage.id] = element;
							}}
							data-stage-id={stage.id}
							className={`journey-scroll-step ${
								index % 2 === 0 ? "journey-step-left" : "journey-step-right"
							}`}
							aria-labelledby={`${stage.id}-title`}
						>
							<article
								className="journey-copy-block"
								data-visible={revealedStages[stage.id]}
								data-active={activeStage.id === stage.id}
							>
								<StageContent stage={stage} />
							</article>
						</section>
					))}
				</div>
			</section>
		</main>
	);
}

function StageContent({ stage }: { stage: JourneyStage }) {
	if (stage.id === "hero") {
		return (
			<>
				<Badge variant="outline" className="journey-kicker-badge">
					Hero
				</Badge>
				<p className="journey-nameplate">{profile.name}</p>
				<h2 id={`${stage.id}-title`} className="journey-title">
					{profile.headline}
				</h2>
				<p className="journey-summary">{profile.support}</p>
			</>
		);
	}

	if (stage.id === "profile") {
		return (
			<>
				<Badge variant="outline" className="journey-kicker-badge">
					Profile
				</Badge>
				<h2 id={`${stage.id}-title`} className="journey-title">
					{stage.title}
				</h2>
				<p className="journey-summary">{stage.summary}</p>
				<p className="journey-summary">
					I am open to roles across the Philippines and open to remote work. I’m
					motivated by projects where I can identify root problems, reduce
					friction, and build systems that teams can sustain long-term.
				</p>
				<Separator className="journey-inline-divider" />
				<p className="journey-education">
					<span>Education</span>
					<span>BS in Computer Science</span>
					<span>Mapúa University</span>
					<span>2018–2023</span>
				</p>
			</>
		);
	}

	if (stage.id === "work") {
		return (
			<>
				<Badge variant="outline" className="journey-kicker-badge">
					Work
				</Badge>
				<h2 id={`${stage.id}-title`} className="journey-title">
					{stage.title}
				</h2>
				<p className="journey-summary">{stage.summary}</p>
				<div className="journey-work-list">
					{selectedWork.map((item) => (
						<article key={item.title} className="journey-work-entry">
							<h3>{item.title}</h3>
							<p className="journey-work-period">{item.period}</p>
							<p>{item.summary}</p>
							<p className="journey-work-tags">{item.tags.join(" • ")}</p>
						</article>
					))}
				</div>
			</>
		);
	}

	if (stage.id === "skills") {
		return (
			<>
				<Badge variant="outline" className="journey-kicker-badge">
					Skills
				</Badge>
				<h2 id={`${stage.id}-title`} className="journey-title">
					{stage.title}
				</h2>
				<p className="journey-summary">{stage.summary}</p>
				<div className="journey-skill-groups">
					{skillGroups.map((group) => (
						<section key={group.group} className="journey-skill-group">
							<p className="journey-skill-group-label">{group.group}</p>
							<div className="journey-skill-row">
								{group.items.map((item) => (
									<SkillPill key={item.name} skill={item} />
								))}
							</div>
						</section>
					))}
				</div>
			</>
		);
	}

	if (stage.id === "contact") {
		return (
			<>
				<Badge variant="outline" className="journey-kicker-badge">
					Contact
				</Badge>
				<h2 id={`${stage.id}-title`} className="journey-title">
					{stage.title}
				</h2>
				<p className="journey-summary">{stage.summary}</p>
				<div className="journey-contact-lines">
					<p>
						<span>Email</span>
						<a href={profile.emailLink}>{profile.email}</a>
					</p>
					<p>
						<span>Location</span>
						<span>{profile.location}</span>
					</p>
				</div>
				<div className="journey-cta-row">
					<Button asChild size="lg">
						<a href={profile.emailLink}>
							<Mail className="size-4" />
							Let's build together
						</a>
					</Button>
				</div>
			</>
		);
	}

	return (
		<>
			<Badge variant="outline" className="journey-kicker-badge">
				Project
			</Badge>
			<h2 id={`${stage.id}-title`} className="journey-title">
				{stage.title}
			</h2>
			<p className="journey-summary">{stage.summary}</p>
			<div className="journey-project-links">
				<a href={profile.github} target="_blank" rel="noreferrer">
					GitHub Progress
				</a>
				<a href={profile.linkedin} target="_blank" rel="noreferrer">
					LinkedIn Updates
				</a>
			</div>
		</>
	);
}
