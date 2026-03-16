import {
	Badge,
	Button,
	Card,
	CardContent,
	Progress,
	Separator,
} from "@r6/ui";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowDown, ArrowUpRight, Mail, MapPin } from "lucide-react";
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

const stageRevealWidth: Record<JourneyStage["id"], number> = {
	hero: 0.24,
	about: 0.2,
	work: 0.22,
	skills: 0.22,
	contact: 0.2,
};

function clamp(value: number, min = 0, max = 1) {
	return Math.min(Math.max(value, min), max);
}

function stageStrength(
	progress: number,
	stageProgress: number,
	width: number,
	smoothing = 1,
) {
	const distance = Math.abs(progress - stageProgress);
	const normalized = clamp(1 - distance / width);
	return normalized ** smoothing;
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
	const trackRef = useRef<HTMLDivElement | null>(null);
	const stageRefs = useRef<
		Partial<Record<JourneyStage["id"], HTMLElement | null>>
	>({});
	const [progress, setProgress] = useState(0);

	useEffect(() => {
		const track = trackRef.current;
		if (!track) {
			return;
		}

		let frame = 0;

		const measureProgress = () => {
			const totalScrollable = Math.max(
				track.offsetHeight - window.innerHeight,
				1,
			);
			const topOffset = track.getBoundingClientRect().top;
			const traveled = clamp(-topOffset, 0, totalScrollable);
			const nextProgress = clamp(traveled / totalScrollable);

			setProgress((current) =>
				Math.abs(current - nextProgress) > 0.0008 ? nextProgress : current,
			);
		};

		const requestMeasure = () => {
			if (frame !== 0) {
				return;
			}
			frame = window.requestAnimationFrame(() => {
				frame = 0;
				measureProgress();
			});
		};

		const resizeObserver = new ResizeObserver(requestMeasure);
		resizeObserver.observe(track);

		measureProgress();
		window.addEventListener("scroll", requestMeasure, { passive: true });
		window.addEventListener("resize", requestMeasure);

		return () => {
			resizeObserver.disconnect();
			window.removeEventListener("scroll", requestMeasure);
			window.removeEventListener("resize", requestMeasure);
			window.cancelAnimationFrame(frame);
		};
	}, []);

	const activeStage = useMemo(() => nearestStage(progress), [progress]);

	const goToStage = (stageId: JourneyStage["id"]) => {
		const stageElement = stageRefs.current[stageId];
		if (!stageElement) {
			return;
		}

		stageElement.scrollIntoView({
			behavior: "smooth",
			block: "start",
		});
	};

	return (
		<main id="main-content" className="journey-main">
			<h1 className="sr-only">
				Interactive portfolio of {profile.name}, full stack engineer
			</h1>
			<section
				className="journey-shell"
				aria-label="Scroll-driven engineering journey"
			>
				<div className="journey-sticky">
					<Suspense fallback={<div className="journey-scene-loading" />}>
						<ScrollJourneyScene progress={progress} />
					</Suspense>

					<div className="journey-overlay">
						<div className="journey-hud">
							<p className="journey-hud-meta">
								<MapPin className="size-3.5" aria-hidden="true" />
								<span>{profile.location}</span>
							</p>
						</div>

						<div className="journey-panel-stack">
							{journeyStages.map((stage) => {
								const strength = stageStrength(
									progress,
									stage.progress,
									stageRevealWidth[stage.id],
									1.35,
								);

								return (
									<article
										key={stage.id}
										className="journey-panel"
										aria-hidden={strength < 0.12}
										style={{
											opacity: strength,
											transform: `translate3d(0, ${Math.round(
												(1 - strength) * 30,
											)}px, 0) scale(${(0.975 + strength * 0.025).toFixed(3)})`,
											pointerEvents: strength > 0.5 ? "auto" : "none",
										}}
									>
										<PanelContent stage={stage} />
									</article>
								);
							})}
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
							<ArrowDown className="size-4" aria-hidden="true" />
							Scroll to continue
						</p>
					</div>
				</div>

				<div ref={trackRef} className="journey-scroll-track" aria-hidden="true">
					{journeyStages.map((stage) => (
						<section
							key={stage.id}
							id={stage.id}
							className="journey-scroll-step"
							ref={(node) => {
								stageRefs.current[stage.id] = node;
							}}
						>
							<h2 className="sr-only">{stage.title}</h2>
							<p className="sr-only">{stage.summary}</p>
						</section>
					))}
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
						<div className="journey-actions">
							<Button asChild size="lg">
								<a href="#contact">Start a build conversation</a>
							</Button>
							<Button asChild variant="outline" size="lg">
								<a href={profile.github} target="_blank" rel="noreferrer">
									GitHub <ArrowUpRight className="size-3.5" />
								</a>
							</Button>
							<Button asChild variant="outline" size="lg">
								<a href={profile.linkedin} target="_blank" rel="noreferrer">
									LinkedIn <ArrowUpRight className="size-3.5" />
								</a>
							</Button>
						</div>
					</CardContent>
				</Card>
			);
		case "about":
			return (
				<Card className="journey-card">
					<CardContent className="journey-card-content">
						<p className="journey-description">{stage.summary}</p>
						<ul className="journey-list">
							<li>Find process gaps quickly and validate the actual bottleneck.</li>
							<li>Design maintainable flows across UI, API, and data boundaries.</li>
							<li>Streamline operations so teams move faster with less friction.</li>
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
						<Button asChild variant="outline" size="lg">
							<a href={profile.github} target="_blank" rel="noreferrer">
								GitHub <ArrowUpRight className="size-3.5" />
							</a>
						</Button>
						<Button asChild variant="outline" size="lg">
							<a href={profile.linkedin} target="_blank" rel="noreferrer">
								LinkedIn <ArrowUpRight className="size-3.5" />
							</a>
						</Button>
						<Separator className="journey-contact-separator" />
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
