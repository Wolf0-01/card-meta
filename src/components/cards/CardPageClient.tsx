"use client";

import { useState } from "react";

import CardCatalog from "./CardCatalog";

import type { CardPreviewData } from "@/types/CardPreviewData";

interface Props {
  cards: CardPreviewData[];
}

export default function CardPageClient({
  cards,
}: Props) {
  const [selectedCard, setSelectedCard] =
    useState<CardPreviewData | null>(null);

  return (
    <>
      <CardCatalog
        cards={cards}
        onSelectCard={setSelectedCard}
      />

      {selectedCard && (
        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black/70
            p-4
          "
          onClick={() =>
            setSelectedCard(null)
          }
        >
          <div
            className="
              w-full
              max-w-sm
              rounded-xl
              border
              border-zinc-700
              bg-zinc-900
              p-6
              shadow-xl
            "
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <img
              src={
                selectedCard.image ??
                "/cards/default.jpg"
              }
              alt={selectedCard.name}
            />

            <h2
              className="
                mt-4
                text-center
                text-xl
                font-bold
              "
            >
              {selectedCard.name}
            </h2>

            <div
              className="
                mt-4
                space-y-2
                text-sm
                text-zinc-300
              "
            >
              <p>
                ID: {selectedCard.id}
              </p>

              {selectedCard.type && (
                <p>
                  Tipo: {selectedCard.type}
                </p>
              )}

              {selectedCard.attribute && (
                <p>
                  Atributo: {selectedCard.attribute}
                </p>
              )}

              {selectedCard.level && (
                <p>
                  Nivel: {selectedCard.level}
                </p>
              )}
            </div>

            <button
              onClick={() =>
                setSelectedCard(null)
              }
              className="
                mt-5
                w-full
                rounded-lg
                bg-blue-600
                py-2
                font-bold
                hover:bg-blue-700
              "
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  );
}