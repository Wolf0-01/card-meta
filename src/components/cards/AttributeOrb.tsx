import Image from "next/image";

/**
 * Ruta oficial del orbe de atributo. Los PNG se recortaron
 * de la hoja oficial de atributos de Yu-Gi-Oh! y viven en
 * `public/icons/attributes`.
 */
const ATTRIBUTE_ICONS: Record<string, string> = {
  DARK: "/icons/attributes/dark.png",

  LIGHT: "/icons/attributes/light.png",

  EARTH: "/icons/attributes/earth.png",

  WATER: "/icons/attributes/water.png",

  FIRE: "/icons/attributes/fire.png",

  WIND: "/icons/attributes/wind.png",

  DIVINE: "/icons/attributes/divine.png",

  SPELL: "/icons/attributes/spell.png",

  TRAP: "/icons/attributes/trap.png",
};

/**
 * Devuelve la ruta del orbe oficial para un atributo o tipo
 * de carta, o `null` si no existe (por ejemplo, Skill).
 */
export function getAttributeIcon(
  value?: string | null
): string | null {
  if (!value) {
    return null;
  }

  return (
    ATTRIBUTE_ICONS[value.toUpperCase()] ?? null
  );
}

interface AttributeOrbProps {
  attribute?: string | null;

  size?: number;

  className?: string;

  alt?: string;
}

/**
 * Orbe oficial de atributo. Se usa como icono decorativo
 * junto a una etiqueta de texto, por eso el `alt` es vacío
 * por defecto.
 */
export default function AttributeOrb({
  attribute,
  size = 24,
  className = "",
  alt = "",
}: AttributeOrbProps) {
  const src = getAttributeIcon(attribute);

  if (!src) {
    return null;
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`shrink-0 object-contain ${className}`}
    />
  );
}
