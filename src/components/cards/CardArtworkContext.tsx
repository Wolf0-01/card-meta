"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface CardArtworkSource {
  id: string;

  image: string;

  isDefault: boolean;
}

export interface CardArtworkOption {
  id: string;

  image: string | null;

  label: string;

  isDefault: boolean;
}

interface CardArtworkContextValue {
  options: CardArtworkOption[];

  selected: CardArtworkOption;

  selectArt: (id: string) => void;
}

const CardArtworkContext =
  createContext<CardArtworkContextValue | null>(
    null
  );

interface CardArtworkProviderProps {
  defaultImage: string | null;

  altArts: CardArtworkSource[];

  children: ReactNode;
}

/**
 * Comparte el arte seleccionado entre la imagen principal y
 * la galería de la ficha sin recargar la página.
 */
export function CardArtworkProvider({
  defaultImage,
  altArts,
  children,
}: CardArtworkProviderProps) {
  const options = useMemo<CardArtworkOption[]>(
    () => {
      const base = altArts.find(
        (art) => art.isDefault
      );

      const alternates = altArts.filter(
        (art) => !art.isDefault
      );

      return [
        {
          id: "default",

          image: base?.image ?? defaultImage,

          label: "Default art",

          isDefault: true,
        },

        ...alternates.map((art, index) => ({
          id: art.id,

          image: art.image,

          label: `Alternate art ${index + 1}`,

          isDefault: false,
        })),
      ];
    },
    [altArts, defaultImage]
  );

  const [selectedId, setSelectedId] =
    useState(options[0]?.id ?? "default");

  const selected =
    options.find(
      (option) => option.id === selectedId
    ) ?? options[0];

  const value = useMemo(
    () => ({
      options,

      selected,

      selectArt: setSelectedId,
    }),
    [options, selected]
  );

  return (
    <CardArtworkContext.Provider value={value}>
      {children}
    </CardArtworkContext.Provider>
  );
}

export function useCardArtwork():
  | CardArtworkContextValue
  | null {
  return useContext(CardArtworkContext);
}
