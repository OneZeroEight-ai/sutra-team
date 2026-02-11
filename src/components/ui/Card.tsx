import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export function Card({ className, hover = false, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-sutra-border bg-sutra-surface p-6",
        hover && "transition-all duration-200 hover:border-sutra-accent/40 hover:shadow-lg hover:shadow-sutra-accent/5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
