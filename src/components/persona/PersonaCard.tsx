import { Card } from "@/components/ui/Card";

interface PersonaCardProps {
  name: string;
  designation: string;
  tagline: string;
  accentColor: string;
  featured?: boolean;
}

export function PersonaCard({
  name,
  designation,
  tagline,
  accentColor,
  featured,
}: PersonaCardProps) {
  return (
    <Card hover className={featured ? "border-sutra-accent/40 relative" : ""}>
      {featured && (
        <div className="absolute -top-3 left-4 px-3 py-0.5 rounded-full bg-sutra-accent text-white text-xs font-medium">
          Featured
        </div>
      )}
      <div
        className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center"
        style={{ backgroundColor: `${accentColor}15` }}
      >
        <div
          className="w-4 h-4 rounded-full"
          style={{ backgroundColor: accentColor }}
        />
      </div>
      <h3 className="text-lg font-semibold text-sutra-text">{name}</h3>
      <p className="text-xs text-sutra-muted mt-1">{designation}</p>
      <p className="mt-3 text-sm text-sutra-muted leading-relaxed">
        {tagline}
      </p>
    </Card>
  );
}
