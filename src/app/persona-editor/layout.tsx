"use client";

import Link from "next/link";
import Image from "next/image";
import { UserButton } from "@clerk/nextjs";

export default function PersonaEditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Hide the root layout's marketing Header and Footer */}
      <style>{`
        body > header { display: none !important; }
        body > footer { display: none !important; }
      `}</style>

      {/* Dashboard-style nav bar matching dashboard.html aesthetic */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          padding: "16px 40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backdropFilter: "blur(20px)",
          background: "rgba(6,6,14,0.8)",
          borderBottom: "1px solid #1E1E3A",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
          <Link
            href="/"
            style={{
              fontWeight: 800,
              fontSize: "16px",
              letterSpacing: "2px",
              color: "#F0EFF4",
              textDecoration: "none",
            }}
          >
            SUTRA
          </Link>
          <Link
            href="/dashboard.html"
            style={{
              color: "#8888AA",
              textDecoration: "none",
              fontSize: "13px",
              letterSpacing: "1px",
              textTransform: "uppercase" as const,
              transition: "color 0.3s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#00D4FF")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#8888AA")}
          >
            Dashboard
          </Link>
          <span
            style={{
              color: "#00D4FF",
              fontSize: "13px",
              letterSpacing: "1px",
              textTransform: "uppercase" as const,
            }}
          >
            Agent Editor
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: { avatarBox: "w-8 h-8" },
            }}
          />
        </div>
      </nav>

      {/* Content area with top padding to account for fixed nav */}
      <div style={{ paddingTop: "64px" }}>{children}</div>
    </>
  );
}
