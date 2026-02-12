import Image from "next/image";
import { Card } from "@/components/ui/Card";

interface AgentCardProps {
  name: string;
  subtitle: string;
  description: string;
  accentColor: string;
  tags?: string[];
  imageSrc?: string;
}

export function AgentCard({
  name,
  subtitle,
  description,
  accentColor,
  tags,
  imageSrc,
}: AgentCardProps) {
  return (
    <Card hover>
      {imageSrc ? (
        <div className="w-10 h-10 rounded-lg mb-4 overflow-hidden relative">
          <Image
            src={imageSrc}
            alt={name}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <div
          className="w-10 h-10 rounded-lg mb-4 flex items-center justify-center"
          style={{ backgroundColor: `${accentColor}20` }}
        >
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: accentColor }}
          />
        </div>
      )}
      <h3 className="text-lg font-semibold text-sutra-text">{name}</h3>
      <p
        className="text-xs font-medium mt-1"
        style={{ color: accentColor }}
      >
        {subtitle}
      </p>
      <p className="mt-3 text-sm text-sutra-muted leading-relaxed">
        {description}
      </p>
      {tags && tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-1 rounded-md bg-sutra-bg text-sutra-muted border border-sutra-border"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </Card>
  );
}
