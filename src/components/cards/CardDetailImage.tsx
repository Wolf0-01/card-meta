"use client";

import { useState } from "react";

import Image from "next/image";

interface CardDetailImageProps {
  ygoproId: number | null;

  image: string | null;

  name: string;
}

/**
 * Imagen principal de la carta.
 *
 * Prioriza el archivo local `/cards/{ygoproId}.jpg` y cae
 * en cascada a `card.image` y al placeholder del catálogo.
 */
export default function CardDetailImage({
  ygoproId,
  image,
  name,
}: CardDetailImageProps) {
  const sources = Array.from(
    new Set(
      [
        ygoproId
          ? `/cards/${ygoproId}.jpg`
          : null,
        image,
        "/cards/default.jpg",
      ].filter(
        (value): value is string =>
          Boolean(value)
      )
    )
  );

  const [index, setIndex] = useState(0);

  const src =
    sources[
      Math.min(index, sources.length - 1)
    ] ?? "/cards/default.jpg";

  return (
    <div className="relative aspect-[59/86] w-full">
      <Image
        src={src}
        alt={name}
        fill
        priority
        sizes="(min-width: 768px) 240px, 60vw"
        unoptimized={index > 0}
        draggable={false}
        onError={() =>
          setIndex((current) =>
            Math.min(
              current + 1,
              sources.length - 1
            )
          )
        }
        className="object-contain"
      />
    </div>
  );
}
