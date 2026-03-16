import { profile } from "../content/portfolio";

export default function Footer() {
	const year = new Date().getFullYear();

	return (
		<footer className="site-footer px-4 pb-10 pt-12">
			<div className="container-shell footer-inner">
				<p className="m-0 text-sm text-muted-foreground">
					&copy; {year} {profile.name}
				</p>
				<div className="footer-links">
					<a href={profile.emailLink} className="footer-link">
						Email
					</a>
					<a
						href={profile.github}
						target="_blank"
						rel="noreferrer"
						className="footer-link"
					>
						GitHub
					</a>
					<a
						href={profile.linkedin}
						target="_blank"
						rel="noreferrer"
						className="footer-link"
					>
						LinkedIn
					</a>
				</div>
			</div>
		</footer>
	);
}
