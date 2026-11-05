import type {
MetaDeck,
} from "@/types/meta";

export const metaDecks: MetaDeck[] = [
// =====================
// TIER 1
// =====================

{
id: "blue-eyes",
name: "Blue-Eyes",
slug: "blue-eyes",
identifier: "blue-eyes",


archetype: {
  id: "blue-eyes",
  name: "Blue-Eyes",
  slug: "blue-eyes",
},

tier: "Tier 1",
tierOrder: 1,

winRate: 62,
popularity: 18,

totalCards: 30,

updatedAt: "2026-07-29",
createdAt: "2026-07-29",

cards: [],

wins: 620,
losses: 380,

tournamentResults: 25,

trend: "up",

format: "Advanced",

description:
  "Deck competitivo basado en Blue-Eyes con gran presencia en el meta.",


},

{
id: "branded",
name: "Branded Despia",
slug: "branded-despia",
identifier: "branded-despia",


archetype: {
  id: "branded",
  name: "Branded",
  slug: "branded",
},

tier: "Tier 1",
tierOrder: 2,

winRate: 60,
popularity: 15,

totalCards: 40,

updatedAt: "2026-07-29",
createdAt: "2026-07-29",

cards: [],

wins: 540,
losses: 360,

tournamentResults: 22,

trend: "stable",

format: "Advanced",

description:
  "Estrategia de fusión con gran consistencia y presencia competitiva.",


},

// =====================
// TIER 2
// =====================

{
id: "dark-magician",
name: "Dark Magician",
slug: "dark-magician",
identifier: "dark-magician",


archetype: {
  id: "dark-magician",
  name: "Dark Magician",
  slug: "dark-magician",
},

tier: "Tier 2",
tierOrder: 3,

winRate: 56,
popularity: 12,

totalCards: 30,

updatedAt: "2026-07-29",
createdAt: "2026-07-29",

cards: [],

wins: 400,
losses: 310,

tournamentResults: 12,

trend: "down",

format: "Advanced",

description:
  "Deck clásico con soporte moderno y control del campo.",


},

// =====================
// TIER 3
// =====================

{
id: "cyber-dragon",
name: "Cyber Dragon",
slug: "cyber-dragon",
identifier: "cyber-dragon",


archetype: {
  id: "cyber-dragon",
  name: "Cyber Dragon",
  slug: "cyber-dragon",
},

tier: "Tier 3",
tierOrder: 4,

winRate: 52,
popularity: 8,

totalCards: 40,

updatedAt: "2026-07-29",
createdAt: "2026-07-29",

cards: [],

wins: 260,
losses: 240,

tournamentResults: 8,

trend: "up",

format: "Advanced",

description:
  "Deck agresivo basado en fusiones y ataques explosivos.",


},

{
id: "heroes",
name: "Elemental HERO",
slug: "elemental-hero",
identifier: "elemental-hero",


archetype: {
  id: "hero",
  name: "HERO",
  slug: "hero",
},

tier: "Tier 3",
tierOrder: 5,

winRate: 50,
popularity: 7,

totalCards: 45,

updatedAt: "2026-07-29",
createdAt: "2026-07-29",

cards: [],

wins: 220,
losses: 220,

tournamentResults: 6,

trend: "stable",

format: "Advanced",

description:
  "Arquetipo HERO con múltiples líneas de fusión.",


},

// =====================
// ROGUE
// =====================

{
id: "zombie-world",
name: "Zombie World",
slug: "zombie-world",
identifier: "zombie-world",


archetype: {
  id: "zombie",
  name: "Zombie",
  slug: "zombie",
},

tier: "Rogue",
tierOrder: 6,

winRate: 48,
popularity: 4,

totalCards: 40,

updatedAt: "2026-07-29",
createdAt: "2026-07-29",

cards: [],

wins: 150,
losses: 160,

tournamentResults: 3,

trend: "stable",

format: "Advanced",

description:
  "Deck alternativo capaz de sorprender en torneos.",


},
];
