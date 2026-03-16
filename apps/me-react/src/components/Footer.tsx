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
					<a href="/#hero" className="footer-link">
						Hero
					</a>
					<a href="/#profile" className="footer-link">
						Profile
					</a>
					<a href="/#work" className="footer-link">
						Work
					</a>
					<a href="/#skills" className="footer-link">
						Skills
					</a>
					<a href="/#contact" className="footer-link">
						Contact
					</a>
					<a href="/#project" className="footer-link">
						Project
					</a>
					<a href={profile.emailLink} className="footer-link">
						Email
					</a>
				</div>
			</div>
		</footer>
	);
}
