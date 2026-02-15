import Link from "next/link";
import { ECOSYSTEM_LINKS } from "@/lib/constants";

const productLinks = [
  { label: "Council", href: "/council" },
  { label: "Connect", href: "/connect" },
  { label: "Personas", href: "/personas" },
  { label: "Pricing", href: "/pricing" },
  { label: "Docs", href: "/docs" },
];

const companyLinks = [
  { label: "About", href: "/about" },
  { label: "For Experts", href: "/experts/join" },
  { label: "Blog", href: "/blog" },
  { label: "The Portable Mind", href: "/book" },
  { label: "Contact", href: "/about#contact" },
];

const legalLinks = [
  { label: "Terms", href: "/terms" },
  { label: "Privacy", href: "/privacy" },
  { label: "Patent Notice", href: "/patent" },
];

export function Footer() {
  return (
    <footer className="border-t border-sutra-border bg-sutra-bg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-sutra-text mb-4">
              Product
            </h3>
            <ul className="space-y-2">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-sutra-muted hover:text-sutra-text transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-sutra-text mb-4">
              Company
            </h3>
            <ul className="space-y-2">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-sutra-muted hover:text-sutra-text transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-sutra-text mb-4">
              Ecosystem
            </h3>
            <ul className="space-y-2">
              {ECOSYSTEM_LINKS.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-sutra-muted hover:text-sutra-text transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-sutra-text mb-4">
              Legal
            </h3>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-sutra-muted hover:text-sutra-text transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-sutra-border">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-sutra-muted">
              &copy; {new Date().getFullYear()}{" "}
              <span className="text-sutra-text font-medium">sutra.team</span>{" "}
              &mdash; Protected by{" "}
              <a
                href="https://sammasuit.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-sutra-accent transition-colors"
              >
                Samm&#x0101;suit.com
              </a>
            </div>
            <div className="text-xs text-sutra-muted">
              Patent Pending &middot; U.S. Provisional Application (Filed
              January 30, 2026) &middot; Inventor: JB Wagoner
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
