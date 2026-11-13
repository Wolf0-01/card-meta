import type { DuelFormat } from "@/lib/duelFormat";

import type {
LinkMarker,
} from "./card";

export interface CardPreviewData {
id: number;

ygoproId: number | null;

name: string;

slug: string;

format: DuelFormat;

image: string | null;

type: string;

attribute: string | null;

race: string | null;

rarity: string | null;

archetype: string | null;

level: number | null;

linkRating: number | null;

linkMarkers: LinkMarker[] | null;

scale: number | null;

attack: number | null;

defense: number | null;

frameType: string | null;

description: string | null;
}

export type {
LinkMarker,
};
