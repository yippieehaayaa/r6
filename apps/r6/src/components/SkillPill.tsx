import { Braces, GitBranch, Network, Wrench } from "lucide-react";
import type { ComponentType } from "react";
import { useMemo, useState } from "react";
import type { SkillIconType, SkillItem } from "../content/portfolio";

const fallbackIconMap: Record<
	SkillIconType,
	ComponentType<{ className?: string }>
> = {
	api: Braces,
	microservices: Network,
	platform: GitBranch,
	workflow: Network,
	tool: Wrench,
};

function initials(label: string) {
	return label
		.split(/\s+/)
		.map((segment) => segment[0] ?? "")
		.join("")
		.slice(0, 2)
		.toUpperCase();
}

function logoUrl(slug: string, color?: string) {
	if (!color) {
		return `https://cdn.simpleicons.org/${slug}`;
	}

	return `https://cdn.simpleicons.org/${slug}/${color}`;
}

export default function SkillPill({ skill }: { skill: SkillItem }) {
	const [imageFailed, setImageFailed] = useState(false);
	const FallbackIcon = useMemo(() => {
		if (skill.icon) {
			return fallbackIconMap[skill.icon];
		}
		return GitBranch;
	}, [skill.icon]);

	return (
		<span className="journey-skill-pill">
			<span className="journey-skill-icon" aria-hidden="true">
				{skill.logoSlug && !imageFailed ? (
					<img
						src={logoUrl(skill.logoSlug, skill.logoColor)}
						alt=""
						width={16}
						height={16}
						loading="lazy"
						onError={() => setImageFailed(true)}
					/>
				) : skill.icon ? (
					<FallbackIcon className="size-3.5" />
				) : (
					<span className="journey-skill-initials">{initials(skill.name)}</span>
				)}
			</span>
			<span>{skill.name}</span>
		</span>
	);
}
