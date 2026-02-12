"use client";

import Image from "next/image";
import { motion } from "framer-motion";

interface AgentAvatarProps {
  name: string;
  pathAspect?: string;
  accentColor: string;
  isSpeaking: boolean;
  size?: "sm" | "md" | "lg";
  imageSrc?: string;
}

export function AgentAvatar({
  name,
  pathAspect,
  accentColor,
  isSpeaking,
  size = "md",
  imageSrc,
}: AgentAvatarProps) {
  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };

  const dotSize = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        {isSpeaking && (
          <motion.div
            className={`absolute inset-0 rounded-full ${sizeClasses[size]}`}
            style={{ backgroundColor: `${accentColor}30` }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
        <div
          className={`${sizeClasses[size]} rounded-full border-2 flex items-center justify-center relative z-10`}
          style={{
            borderColor: isSpeaking ? accentColor : "var(--sutra-border)",
            backgroundColor: "var(--sutra-surface)",
          }}
        >
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={name}
              fill
              className="rounded-full object-cover"
            />
          ) : (
            <div
              className={`${dotSize[size]} rounded-full`}
              style={{ backgroundColor: accentColor }}
            />
          )}
        </div>
      </div>
      <div className="text-center">
        <p className="text-xs font-medium text-sutra-text truncate max-w-[100px]">
          {name}
        </p>
        {pathAspect && (
          <p className="text-[10px] text-sutra-muted truncate max-w-[100px]">
            {pathAspect}
          </p>
        )}
      </div>
    </div>
  );
}
