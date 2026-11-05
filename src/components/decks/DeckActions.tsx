"use client";

import Button from "@/components/ui/Button";

import { MetaDeck } from "@/types/meta";

import { exportDeckAsYdk } from "@/services/decks/export";

interface Props {
  deck: MetaDeck;
}

export default function DeckActions({
  deck,
}: Props) {
  async function copyLink() {
    const url = window.location.href;

    await navigator.clipboard.writeText(
      url
    );
  }

  async function copyDeckName() {
    await navigator.clipboard.writeText(
      deck.name
    );
  }

  function exportDeck() {
    exportDeckAsYdk(deck);
  }

  async function shareDeck() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: deck.name,
          text: `Mira este deck: ${deck.name}`,
          url: window.location.href,
        });

        return;
      } catch {
        // Usuario canceló el diálogo
      }
    }

    copyLink();
  }

  return (
    <div
      className="
        flex
        flex-wrap
        gap-3
      "
    >
      <Button
        variant="primary"
        onClick={copyDeckName}
      >
        Copiar nombre
      </Button>

      <Button
        variant="secondary"
        onClick={copyLink}
      >
        Copiar enlace
      </Button>

      <Button
        variant="secondary"
        onClick={exportDeck}
      >
        Exportar .ydk
      </Button>

      <Button
        variant="ghost"
        onClick={shareDeck}
      >
        Compartir
      </Button>
    </div>
  );
}