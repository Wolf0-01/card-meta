export interface CardPreview {
id: number;

name: string;

type: string;

attribute: string | null;

level: number | null;

attack: number | null;

defense: number | null;

atk: number | null;

def: number | null;

image: string | null;

description: string;

rarity: string | null;

archetype: string | null;

race: string | null;

frameType: string | null;

scale: number | null;

linkRating: number | null;

linkMarkers: unknown | null;
}

export interface DeckPreview {
id: string;

slug: string;

identifier: string;

name: string;

archetype: {
name: string;
} | null;

tier: string | null;

winRate: number;

popularity: number;

totalCards: number;
}
