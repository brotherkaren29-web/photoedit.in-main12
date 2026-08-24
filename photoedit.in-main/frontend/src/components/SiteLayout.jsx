import { Link, useLocation } from "react-router-dom";
import { SITE_NAME, LAUNCH_YEAR, CONTACT_EMAIL } from "../config";
import "../site.css";

const nav = [
  { to: "/", label: "Home" },
  { to: "/editor", label: "Editor" },
  { to: "/about", label: "About" },
  { to: "/privacy", label: "Privacy" },
  { to: "/terms", label: "Terms" },
  { to: "/disclaimer", label: "Disclaimer" },
  { to: "/contact", label: "Contact" },
];

export default function SiteLayout({ title, subtitle, children }) {
  const { pathname } = useLocation();
  return (
    <div className="site" data-testid="site-layout">
      <header className="site-header">
        <Link to="/" className="site-brand" data-testid="site-brand-link">
          <span className="brand-mark">p</span>
          <span>{SITE_NAME.replace(".in", "")}<span className="brand-dot">.in</span></span>
        </Link>
        <nav className="site-nav" data-testid="site-nav">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={pathname === item.to ? "active" : ""}
              data-testid={`nav-link-${item.label.toLowerCase()}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="site-main">
        {title && (
          <section className="page-hero">
            <span className="page-eyebrow">{SITE_NAME}</span>
            <h1 data-testid="page-title">{title}</h1>
            {subtitle && <p className="page-subtitle">{subtitle}</p>}
          </section>
        )}
        <div className="page-body">{children}</div>
      </main>
      <footer className="site-footer" data-testid="site-footer">
        <div className="footer-inner">
          <div>
            <div className="footer-brand">
              <span className="brand-mark">p</span>
              <span>{SITE_NAME}</span>
            </div>
            <p className="footer-tag">Free browser image & screenshot editor. No signup, no downloads.</p>
          </div>
          <div className="footer-links">
            {nav.map((item) => (
              <Link key={item.to} to={item.to} data-testid={`footer-link-${item.label.toLowerCase()}`}>{item.label}</Link>
            ))}
          </div>
          <div className="footer-contact">
            <div>Questions? <a href={`mailto:${CONTACT_EMAIL}`} data-testid="footer-contact-email">{CONTACT_EMAIL}</a></div>
            <div className="footer-copy">© {LAUNCH_YEAR} {SITE_NAME}. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
