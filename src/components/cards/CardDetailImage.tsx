"use client";

import { useState } from "react";

import Image from "next/image";

import { useCardArtwork } from "@/components/cards/CardArtworkContext";

interface CardDetailImageProps {
  ygoproId: number | null;

  image: string | null;

  name: string;
}

/**
 * Imagen principal de la carta.
 *
 * Para el arte por defecto prioriza el archivo local
 * `/cards/{ygoproId}.jpg` y cae en cascada a `card.image` y
 * al placeholder del catálogo. Cuando se selecciona un arte
 * alternativo en la galería muestra esa imagen.
 */
export default function CardDetailImage({
  ygoproId,
  image,
  name,
}: CardDetailImageProps) {
  const artwork = useCardArtwork();

  const selected = artwork?.selected;

  const isDefault = selected?.isDefault ?? true;

  const selectedImage =
    selected?.image ?? image;

  const sources = Array.from(
    new Set(
      [
        isDefault && ygoproId
          ? `/cards/${ygoproId}.jpg`
          : null,
        selectedImage,
        "/cards/default.jpg",
      ].filter(
        (value): value is string =>
          Boolean(value)
      )
    )
  );

  const selectedId =
    selected?.id ?? "default";

  /*
   * El índice de respaldo se reinicia al cambiar de arte sin
   * usar un efecto: solo se conserva mientras el arte
   * seleccionado sea el mismo.
   */
  const [fallback, setFallback] = useState({
    artId: selectedId,

    index: 0,
  });

  const index =
    fallback.artId === selectedId
      ? fallback.index
      : 0;

  const src =
    sources[
      Math.min(index, sources.length - 1)
    ] ?? "/cards/default.jpg";

  return (
    <div
      className="
        relative
        aspect-[59/86]
        w-full
        overflow-hidden
        rounded-xl
        bg-slate-950
      "
    >
      <Image
        src={src}
        alt={name}
        fill
        priority
        sizes="(min-width: 768px) 240px, 60vw"
        unoptimized={index > 0 || !isDefault}
        draggable={false}
        onError={() =>
          setFallback({
            artId: selectedId,

            index: Math.min(
              index + 1,
              sources.length - 1
            ),
          })
        }
        className="object-cover"
      />
    </div>
  );
}
