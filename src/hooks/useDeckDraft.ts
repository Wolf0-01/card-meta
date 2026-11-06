"use client";

import {
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";

import type { CardPreviewData } from "@/types/CardPreviewData";

import type { DeckZone } from "@/types/deck";

import type { DraftCard } from "@/types/deck-draft";

import {
  addDraftCard,
  clearDraftCards,
  getDraftStats,
  moveDraftCard,
  removeDraftCard,
  setDraftCardQuantity,
  validateDraft,
} from "@/lib/decks/draft";

const STORAGE_KEY =
  "cardmeta-deck-draft-v1";

const EMPTY_CARDS: DraftCard[] = [];

/*
 * `useSyncExternalStore` nos permite saber cuándo
 * termina la hidratación sin llamar a setState
 * dentro de un efecto (evita desajustes SSR/cliente).
 */
function subscribeToHydration() {
  return () => {};
}

function getClientHydrationSnapshot() {
  return true;
}

function getServerHydrationSnapshot() {
  return false;
}

interface StoredDraft {
  cards: DraftCard[];

  name: string;

  description: string;

  isPublic: boolean;
}

function readStoredDraft(): StoredDraft | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw =
      window.localStorage.getItem(
        STORAGE_KEY
      );

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(
      raw
    ) as Partial<StoredDraft>;

    if (!Array.isArray(parsed.cards)) {
      return null;
    }

    return {
      cards: parsed.cards,

      name:
        typeof parsed.name === "string"
          ? parsed.name
          : "",

      description:
        typeof parsed.description ===
        "string"
          ? parsed.description
          : "",

      isPublic:
        typeof parsed.isPublic ===
        "boolean"
          ? parsed.isPublic
          : false,
    };
  } catch {
    return null;
  }
}

/**
 * Estado del borrador del Deck Builder (Fase 4).
 * Mantiene las mismas reglas que el backend y
 * persiste el trabajo sin guardar en localStorage.
 */
export default function useDeckDraft() {
  const [
    initialDraft,
  ] = useState(readStoredDraft);

  const [cards, setCards] = useState<
    DraftCard[]
  >(() => initialDraft?.cards ?? []);

  const [name, setName] = useState(
    () => initialDraft?.name ?? ""
  );

  const [description, setDescription] =
    useState(
      () =>
        initialDraft?.description ?? ""
    );

  const [isPublic, setIsPublic] =
    useState(
      () => initialDraft?.isPublic ?? false
    );

  const hasLoadedStorage =
    useSyncExternalStore(
      subscribeToHydration,
      getClientHydrationSnapshot,
      getServerHydrationSnapshot
    );

  useEffect(() => {
    if (!hasLoadedStorage) {
      return;
    }

    try {
      window.localStorage.setItem(
        STORAGE_KEY,

        JSON.stringify({
          cards,
          name,
          description,
          isPublic,
        })
      );
    } catch {
      /*
       * Ignorar errores de almacenamiento
       * (modo privado o cuota llena).
       */
    }
  }, [
    cards,
    name,
    description,
    isPublic,
    hasLoadedStorage,
  ]);

  /*
   * Antes de hidratar no mostramos el borrador
   * guardado para que servidor y cliente rendericen
   * exactamente lo mismo.
   */
  const visibleCards = hasLoadedStorage
    ? cards
    : EMPTY_CARDS;

  const stats = useMemo(
    () => getDraftStats(visibleCards),
    [visibleCards]
  );

  const validation = useMemo(
    () => validateDraft(visibleCards),
    [visibleCards]
  );

  function addCard(
    card: CardPreviewData,
    zone?: DeckZone
  ) {
    setCards((current) =>
      addDraftCard(current, card, zone)
    );
  }

  function removeCard(
    cardId: number,
    zone: DeckZone
  ) {
    setCards((current) =>
      removeDraftCard(
        current,
        cardId,
        zone
      )
    );
  }

  function setQuantity(
    cardId: number,
    zone: DeckZone,
    quantity: number
  ) {
    setCards((current) =>
      setDraftCardQuantity(
        current,
        cardId,
        zone,
        quantity
      )
    );
  }

  function moveCard(
    cardId: number,
    from: DeckZone,
    to: DeckZone
  ) {
    setCards((current) =>
      moveDraftCard(
        current,
        cardId,
        from,
        to
      )
    );
  }

  function clearDeck() {
    setCards(clearDraftCards());

    setName("");

    setDescription("");

    setIsPublic(false);

    /*
     * Borramos también el almacenamiento de forma
     * inmediata para que el borrador no reaparezca
     * si la navegación ocurre antes del siguiente
     * efecto de persistencia.
     */
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(
          STORAGE_KEY
        );
      } catch {
        /* Sin acceso a localStorage. */
      }
    }
  }

  function replaceCards(
    nextCards: DraftCard[]
  ) {
    setCards(nextCards);
  }

  return {
    cards: visibleCards,

    name: hasLoadedStorage ? name : "",

    setName,

    description: hasLoadedStorage
      ? description
      : "",

    setDescription,

    isPublic: hasLoadedStorage
      ? isPublic
      : false,

    setIsPublic,

    stats,

    validation,

    hasLoadedStorage,

    addCard,

    removeCard,

    setQuantity,

    moveCard,

    clearDeck,

    replaceCards,
  };
}
