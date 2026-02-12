"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { NAV_LINKS } from "@/lib/constants";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-sutra-border bg-sutra-bg/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2"
          >
            <Image
              src="/images/logo.png"
              alt="Sutra.team"
              width={36}
              height={36}
              className="rounded-full"
            />
            <span className="text-lg font-bold tracking-wide text-sutra-text">
              SUTRA
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-sutra-muted hover:text-sutra-text transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Button variant="secondary" href="/pricing">
              View Pricing
            </Button>
            <Button href="/connect">Start a Session</Button>
          </div>

          <button
            className="md:hidden text-sutra-muted hover:text-sutra-text cursor-pointer"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-sutra-border bg-sutra-bg">
          <div className="px-4 py-4 space-y-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-sm text-sutra-muted hover:text-sutra-text transition-colors py-2"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 flex flex-col gap-2">
              <Button variant="secondary" href="/pricing">
                View Pricing
              </Button>
              <Button href="/connect">Start a Session</Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
