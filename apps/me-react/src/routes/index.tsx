import { Badge, Button, Card, CardContent, Progress } from "@r6/ui";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpDown, Mail } from "lucide-react";
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

export const Route = createFileRoute("/")({
	component: PortfolioJourneyPage,
});

function PortfolioJourneyPage() {
	const initialProgress = journeyStages[0]?.progress ?? 0;
	const progressRef = useRef(initialProgress);
	const targetProgressRef = useRef(initialProgress);
	const keysRef = useRef({ up: false, down: false });
	const [progress, setProgress] = useState(initialProgress);

	useEffect(() => {
		progressRef.current = progress;
	}, [progress]);

	useEffect(() => {
		let frame = 0;
		let previousTime = performance.now();

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

			if (event.key === "ArrowUp") {
				keysRef.current.up = true;
				event.preventDefault();
			}
			if (event.key === "ArrowDown") {
				keysRef.current.down = true;
				event.preventDefault();
			}
		};

		const onKeyUp = (event: KeyboardEvent) => {
			if (event.key === "ArrowUp") {
				keysRef.current.up = false;
			}
			if (event.key === "ArrowDown") {
				keysRef.current.down = false;
			}
		};

		const clearKeys = () => {
			keysRef.current.up = false;
			keysRef.current.down = false;
		};

		const tick = (time: number) => {
			const dt = Math.min((time - previousTime) / 1000, 0.05);
			previousTime = time;

			const speed = 0.52;
			let target = targetProgressRef.current;
			if (keysRef.current.up && !keysRef.current.down) {
				target += speed * dt;
			}
			if (keysRef.current.down && !keysRef.current.up) {
				target -= speed * dt;
			}
			target = clamp(target);
			targetProgressRef.current = target;

			const current = progressRef.current;
			const lerpFactor = 1 - Math.exp(-8 * dt);
			const next = current + (target - current) * lerpFactor;
			if (Math.abs(next - current) > 0.0001) {
				progressRef.current = next;
				setProgress(next);
			}

			frame = window.requestAnimationFrame(tick);
		};

		frame = window.requestAnimationFrame(tick);
		window.addEventListener("keydown", onKeyDown, { passive: false });
		window.addEventListener("keyup", onKeyUp);
		window.addEventListener("blur", clearKeys);

		return () => {
			window.removeEventListener("keydown", onKeyDown);
			window.removeEventListener("keyup", onKeyUp);
			window.removeEventListener("blur", clearKeys);
			window.cancelAnimationFrame(frame);
		};
	}, []);

	const activeStage = useMemo(() => nearestStage(progress), [progress]);

	const goToStage = (stageId: JourneyStage["id"]) => {
		const stage = journeyStages.find((item) => item.id === stageId);
		if (!stage) {
			return;
		}
		targetProgressRef.current = stage.progress;
	};

	return (
		<main id="main-content" className="journey-main">
			<h1 className="sr-only">
				Interactive portfolio of {profile.name}, full stack engineer
			</h1>
			<section
				className="journey-shell"
				aria-label="Arrow-key-driven engineering journey"
			>
				<div className="journey-sticky">
					<Suspense fallback={<div className="journey-scene-loading" />}>
						<ScrollJourneyScene progress={progress} />
					</Suspense>

					<div className="journey-overlay">
						<div className="journey-hud">
							<p className="journey-hud-name">{profile.name}</p>
							<div className="journey-hud-links">
								<a
									href={profile.github}
									target="_blank"
									rel="noreferrer"
									className="journey-social-link"
									aria-label="Open GitHub profile"
								>
									<SocialLogo kind="github" />
								</a>
								<a
									href={profile.linkedin}
									target="_blank"
									rel="noreferrer"
									className="journey-social-link"
									aria-label="Open LinkedIn profile"
								>
									<SocialLogo kind="linkedin" />
								</a>
							</div>
						</div>

						<div className="journey-panel-stack">
							<article key={activeStage.id} className="journey-panel">
								<PanelContent stage={activeStage} />
							</article>
						</div>

						<div className="journey-progress-rail" aria-live="polite">
							<div className="journey-progress-head">
								<p className="journey-progress-label">{activeStage.kicker}</p>
								<p className="journey-progress-value">
									{Math.round(progress * 100)}%
								</p>
							</div>
							<Progress
								value={progress * 100}
								className="journey-progress-bar"
							/>
							<ol className="journey-progress-stops">
								{journeyStages.map((stage) => {
									const isActive = stage.id === activeStage.id;
									return (
										<li key={stage.id}>
											<a
												href={`#${stage.id}`}
												className="journey-stop-link"
												data-active={isActive}
												aria-current={isActive ? "step" : undefined}
												onClick={(event) => {
													event.preventDefault();
													goToStage(stage.id);
												}}
											>
												{stage.kicker}
											</a>
										</li>
									);
								})}
							</ol>
						</div>

						<p className="journey-scroll-hint">
							<ArrowUpDown className="size-4" aria-hidden="true" />
							Use up/down arrows to drive
						</p>
					</div>
				</div>
			</section>
		</main>
	);
}

function PanelContent({ stage }: { stage: JourneyStage }) {
	switch (stage.id) {
		case "hero":
			return (
				<Card className="journey-card">
					<CardContent className="journey-card-content">
						<p className="journey-copy-primary">{profile.headline}</p>
						<p className="journey-description">{profile.support}</p>
					</CardContent>
				</Card>
			);
		case "about":
			return (
				<Card className="journey-card">
					<CardContent className="journey-card-content">
						<p className="journey-description">{stage.summary}</p>
						<ul className="journey-list">
							<li>
								Find process gaps quickly and validate the actual bottleneck.
							</li>
							<li>
								Design maintainable flows across UI, API, and data boundaries.
							</li>
							<li>
								Streamline operations so teams move faster with less friction.
							</li>
						</ul>
					</CardContent>
				</Card>
			);
		case "work":
			return (
				<Card className="journey-card">
					<CardContent className="journey-card-content journey-work-grid">
						<p className="journey-description">{stage.summary}</p>
						{selectedWork.map((project) => (
							<article key={project.title} className="journey-work-item">
								<p>{project.summary}</p>
								<div className="journey-tag-row">
									{project.tags.map((tag) => (
										<Badge key={tag} variant="secondary">
											{tag}
										</Badge>
									))}
								</div>
							</article>
						))}
					</CardContent>
				</Card>
			);
		case "skills":
			return (
				<Card className="journey-card">
					<CardContent className="journey-card-content journey-skills-grid">
						<p className="journey-description">{stage.summary}</p>
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
					</CardContent>
				</Card>
			);
		case "contact":
			return (
				<Card className="journey-card">
					<CardContent className="journey-card-content journey-contact-actions">
						<p className="journey-description">{stage.summary}</p>
						<Button asChild size="lg">
							<a href={profile.emailLink}>
								<Mail className="size-4" />
								{profile.email}
							</a>
						</Button>
						<p className="journey-contact-note">
							Open to building practical software systems with product teams and
							operations-heavy environments.
						</p>
					</CardContent>
				</Card>
			);
		default:
			return null;
	}
}

function SocialLogo({ kind }: { kind: "github" | "linkedin" }) {
	const [failed, setFailed] = useState(false);

	if (failed) {
		return (
			<span className="journey-social-fallback" aria-hidden="true">
				{kind === "linkedin" ? "in" : "GH"}
			</span>
		);
	}

	const src =
		kind === "github"
			? "https://cdn.simpleicons.org/github/FFFFFF"
			: "https://cdn.simpleicons.org/linkedin/0A66C2";

	return (
		<img
			src={src}
			alt=""
			width={16}
			height={16}
			onError={() => setFailed(true)}
		/>
	);
}
