"use client";

import Image from "next/image";

interface CardImageProps {
  src?: string | null;
  alt: string;
  priority?: boolean;
  className?: string;
}

export default function CardImage({
  src,
  alt,
  priority = false,
  className = "",
}: CardImageProps) {
  return (
    <div
      className="
        overflow-hidden
        rounded-lg
      "
    >
      <Image
        src={src ?? "/cards/default.jpg"}
        alt={alt}
        width={220}
        height={320}
        priority={priority}
        sizes="220px"
        className={`
          h-auto
          w-full
          object-contain
          transition-transform
          duration-300
          group-hover:scale-105
          ${className}
        `}
      />
    </div>
  );
}