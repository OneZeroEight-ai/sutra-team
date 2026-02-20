import Link from "next/link";
import { ECOSYSTEM_LINKS } from "@/lib/constants";

const productLinks = [
  { label: "Agents", href: "/#agents" },
  { label: "Channels", href: "/#channels" },
  { label: "Council", href: "/council" },
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
              &mdash;{" "}
              <a
                href="https://onezeroeight.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-sutra-accent transition-colors"
              >
                OneZeroEight.ai
              </a>
            </div>
            <div className="flex gap-4 text-xs text-sutra-muted">
              <a href="https://x.com/sutra_ai" target="_blank" rel="noopener noreferrer" className="hover:text-sutra-accent transition-colors">@sutra_ai</a>
              <a href="https://x.com/sammasuit" target="_blank" rel="noopener noreferrer" className="hover:text-sutra-accent transition-colors">@sammasuit</a>
              <a href="https://x.com/jbwagoner" target="_blank" rel="noopener noreferrer" className="hover:text-sutra-accent transition-colors">@jbwagoner</a>
              <a href="https://x.com/OneZeroEight_ai" target="_blank" rel="noopener noreferrer" className="hover:text-sutra-accent transition-colors">@onezeroeight_ai</a>
            </div>
          </div>
          <p className="mt-4 text-center text-xs text-sutra-muted/60">
            Protected by Samm&#x0101; Suit &middot; Open Source &middot; Built in Los Angeles
          </p>
        </div>
      </div>
    </footer>
  );
}
