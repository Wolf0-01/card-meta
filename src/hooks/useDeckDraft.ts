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

export interface DeckDraftSeed {
  cards: DraftCard[];

  name: string;

  description: string;

  isPublic: boolean;
}

interface UseDeckDraftOptions {
  /**
   * Datos iniciales para editar un mazo existente.
   * Cuando se indican, no se lee el borrador local.
   */
  initialDraft?: DeckDraftSeed | null;

  /**
   * Clave de localStorage. Usa `null` para desactivar
   * la persistencia (por ejemplo, en el editor de un mazo).
   */
  storageKey?: string | null;
}

function readStoredDraft(
  storageKey: string | null
): DeckDraftSeed | null {
  if (
    !storageKey ||
    typeof window === "undefined"
  ) {
    return null;
  }

  try {
    const raw =
      window.localStorage.getItem(
        storageKey
      );

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(
      raw
    ) as Partial<DeckDraftSeed>;

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
export default function useDeckDraft({
  initialDraft: seed = null,
  storageKey = STORAGE_KEY,
}: UseDeckDraftOptions = {}) {
  const [
    initialDraft,
  ] = useState<DeckDraftSeed | null>(
    () =>
      seed ??
      readStoredDraft(storageKey)
  );

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

  /*
   * Un mazo que viene del servidor ya está listo
   * desde el primer render (SSR y cliente).
   */
  const isReady =
    seed !== null || hasLoadedStorage;

  useEffect(() => {
    if (!isReady || !storageKey) {
      return;
    }

    try {
      window.localStorage.setItem(
        storageKey,

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
    isReady,
    storageKey,
  ]);

  /*
   * Antes de hidratar no mostramos el borrador
   * guardado para que servidor y cliente rendericen
   * exactamente lo mismo.
   */
  const visibleCards = isReady
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
    if (storageKey && typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(
          storageKey
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

    name: isReady ? name : "",

    setName,

    description: isReady
      ? description
      : "",

    setDescription,

    isPublic: isReady
      ? isPublic
      : false,

    setIsPublic,

    stats,

    validation,

    hasLoadedStorage: isReady,

    addCard,

    removeCard,

    setQuantity,

    moveCard,

    clearDeck,

    replaceCards,
  };
}
