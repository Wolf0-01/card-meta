"use client";

import CardGrid from "./CardGrid";

import type {
CardPreviewData,
} from "@/types/CardPreviewData";

interface CardResultsProps {
cards: CardPreviewData[];

onAddCard: (
card: CardPreviewData
) => void;
}

export default function CardResults({
cards,
onAddCard,
}: CardResultsProps) {
return (
<CardGrid
title={`Cards (${cards.length})`}
cards={cards}
onCardClick={onAddCard}
/>
);
}
