"use client";

import Image from "next/image";

import { useCardArtwork } from "@/components/cards/CardArtworkContext";

interface CardArtworkGalleryProps {
  cardName: string;
}

/**
 * Galería interactiva de artes. Al pulsar una miniatura se
 * actualiza la imagen principal de la ficha.
 */
export default function CardArtworkGallery({
  cardName,
}: CardArtworkGalleryProps) {
  const artwork = useCardArtwork();

  if (!artwork || artwork.options.length <= 1) {
    return null;
  }

  const { options, selected, selectArt } =
    artwork;

  return (
    <section
      className="
        rounded-2xl
        border
        border-slate-700/60
        bg-[#0B132B]
        p-5
        sm:p-6
      "
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2
          className="
            text-[11px]
            font-black
            uppercase
            tracking-[0.2em]
            text-slate-300
          "
        >
          Artworks
        </h2>

        <span className="text-[11px] font-semibold text-slate-500">
          {options.length}{" "}
          {options.length === 1
            ? "version"
            : "versions"}{" "}
          available
        </span>
      </div>

      <ul
        className="
          mt-3
          grid
          grid-cols-2
          gap-3
          sm:grid-cols-3
          md:grid-cols-4
        "
      >
        {options.map((option) => {
          const isSelected =
            option.id === selected.id;

          return (
            <li key={option.id}>
              <button
                type="button"
                onClick={() =>
                  selectArt(option.id)
                }
                aria-pressed={isSelected}
                title={`Show ${option.label.toLowerCase()}`}
                className="
                  group
                  block
                  w-full
                  text-left
                "
              >
                <div
                  className={`
                    relative
                    aspect-[59/86]
                    overflow-hidden
                    rounded-lg
                    border
                    bg-slate-900
                    transition-all
                    ${
                      isSelected
                        ? "border-amber-300 shadow-[0_0_18px_rgba(251,191,36,0.35)] ring-2 ring-amber-300/70"
                        : "border-slate-600/70 group-hover:border-blue-400/70 group-hover:ring-2 group-hover:ring-blue-400/30"
                    }
                  `}
                >
                  {option.image && (
                    <Image
                      src={option.image}
                      alt={
                        option.isDefault
                          ? cardName
                          : `${cardName} ${option.label.toLowerCase()}`
                      }
                      fill
                      sizes="(min-width: 768px) 180px, 45vw"
                      draggable={false}
                      className="object-cover"
                    />
                  )}
                </div>

                <span
                  className={`
                    mt-1.5
                    block
                    truncate
                    text-center
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[0.12em]
                    transition-colors
                    ${
                      isSelected
                        ? "text-amber-200"
                        : "text-slate-500 group-hover:text-blue-200"
                    }
                  `}
                >
                  {option.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
