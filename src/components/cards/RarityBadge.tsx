import Image from "next/image";

import {
  normalizeRarity,
  type CardRarity,
} from "./cardRarity";

/**
 * Etiquetas inclinadas oficiales de rareza. Los PNG viven en
 * `public/icons` y mantienen su proporción 160×64 al
 * renderizarse con una altura fija y `w-auto`.
 */
export const RARITY_ICON_SRC: Record<
  CardRarity,
  string
> = {
  UR: "/icons/rarity-ur.png",
  SR: "/icons/rarity-sr.png",
  R: "/icons/rarity-r.png",
  N: "/icons/rarity-n.png",
};

export type RarityBadgeSize =
  | "xs"
  | "sm"
  | "md"
  | "lg";

const SIZE_CLASSES: Record<
  RarityBadgeSize,
  string
> = {
  xs: "h-3.5",
  sm: "h-4",
  md: "h-5",
  lg: "h-7",
};

interface RarityBadgeProps {
  rarity: string | null | undefined;

  size?: RarityBadgeSize;

  className?: string;
}

/**
 * Badge de rareza compartido por fichas, miniaturas, tooltips,
 * Deck Builder, visor de mazos y Breakdown. El llamador se
 * encarga de posicionarlo (normalmente sobre la esquina
 * superior derecha de la carta).
 */
export default function RarityBadge({
  rarity,
  size = "sm",
  className = "",
}: RarityBadgeProps) {
  const normalized = normalizeRarity(rarity);

  return (
    <Image
      src={RARITY_ICON_SRC[normalized]}
      alt={`${normalized} rarity`}
      width={160}
      height={64}
      unoptimized
      draggable={false}
      className={`
        pointer-events-none
        w-auto
        select-none
        drop-shadow-[0_2px_3px_rgba(0,0,0,0.55)]
        ${SIZE_CLASSES[size]}
        ${className}
      `}
    />
  );
}
