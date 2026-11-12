interface CardImageSource {
  image?: string | null;

  ygoproId?: number | null;
}

/**
 * Devuelve la ruta pública de la imagen de una carta.
 *
 * Prioriza el campo `image` ya sincronizado y, si falta,
 * reconstruye la ruta canónica `/cards/{ygoproId}.jpg`.
 */
export function getCardImageSrc(
  card: CardImageSource | null | undefined
): string | null {
  if (!card) {
    return null;
  }

  const image = card.image?.trim();

  if (image) {
    return image;
  }

  if (
    typeof card.ygoproId === "number" &&
    card.ygoproId > 0
  ) {
    return `/cards/${card.ygoproId}.jpg`;
  }

  return null;
}
