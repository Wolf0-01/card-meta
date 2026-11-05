"use client";

import { useState } from "react";

import Card from "@/components/ui/Card";

import ImportDeckButton from "./ImportDeckButton";
import ImportedDeckViewer from "./ImportedDeckViewer";

import { importDeck } from "@/services/client/importDeck";

import type { ImportedDeckResult } from "@/types/imported-deck";

export default function ImportDeckPanel() {
  const [deck, setDeck] =
    useState<ImportedDeckResult | null>(null);

  async function handleImport(
    content: string
  ) {
    const imported =
      await importDeck(content);

    setDeck(imported);
  }

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold">
          Importar Deck
        </h2>

        <p className="mt-2 text-sm text-foreground-muted">
          Selecciona un archivo .ydk para reconstruir el
          deck desde la base de datos.
        </p>
      </div>

      <ImportDeckButton
        onImport={handleImport}
      />

      {deck && (
        <ImportedDeckViewer
          deck={deck}
        />
      )}
    </Card>
  );
}