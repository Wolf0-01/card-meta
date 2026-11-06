"use client";

import { useState } from "react";

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
  const [failed, setFailed] = useState(false);

  const imageSrc =
    failed || !src
      ? "/cards/default.jpg"
      : src;

  return (
    <div
      className="
        overflow-hidden
        rounded-lg
      "
    >
      <Image
        src={imageSrc}
        alt={alt}
        width={220}
        height={320}
        priority={priority}
        sizes="220px"
        unoptimized={failed}
        onError={() => setFailed(true)}
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