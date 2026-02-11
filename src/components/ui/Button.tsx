"use client";

import { cn } from "@/lib/utils";
import { forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  href?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-sutra-accent text-white hover:bg-sutra-accent/90 shadow-lg shadow-sutra-accent/20",
  secondary:
    "border border-sutra-border text-sutra-text hover:bg-sutra-surface hover:border-sutra-muted",
  ghost: "text-sutra-muted hover:text-sutra-text hover:bg-sutra-surface",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", href, children, ...props }, ref) => {
    const styles = cn(
      "inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sutra-accent/50 disabled:opacity-50 disabled:pointer-events-none cursor-pointer",
      variantStyles[variant],
      className
    );

    if (href) {
      return (
        <a href={href} className={styles}>
          {children}
        </a>
      );
    }

    return (
      <button ref={ref} className={styles} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export { Button };
