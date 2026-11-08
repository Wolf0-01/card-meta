import type {
  Skill,
  SkillCategory,
} from "@/types/skill";

export const SKILL_CATEGORY_LABELS: Record<
  SkillCategory,
  string
> = {
  robo: "Robo",
  campo: "Campo",
  ataque: "ATK",
  fusion: "Fusión",
  invocacion: "Invocación",
  recuperacion: "LP",
  especial: "Especial",
};

/**
 * Catálogo curado de Skills de Yu-Gi-Oh! Duel Links.
 * Los textos de efecto y requisito provienen de la
 * descripción oficial de cada habilidad en el juego.
 */
export const SKILLS: Skill[] = [
  {
    id: "destiny-draw",
    name: "Destiny Draw",
    character: "Yami Yugi",
    category: "robo",
    description:
      "Can be used before your normal draw when your Life Points decrease by 2000. One of the cards from your normal draw this turn will be a card of your choice. This Skill can only be used once per Duel.",
  },
  {
    id: "beatdown",
    name: "Beatdown",
    character: "Seto Kaiba",
    category: "ataque",
    description:
      "Until the end of the turn, increase the ATK of all face-up Level 5 or higher monsters you control by the number of Level 5 or higher monsters you control times 300. This Skill can only be used once per Duel.",
  },
  {
    id: "draw-sense-spell-trap",
    name: "Draw Sense: Spell/Trap",
    character: "Yami Yugi",
    category: "robo",
    description:
      "Can be used before your normal draw each time your Life Points decrease by 1000. One of the cards from your normal draw this turn will be a random Spell/Trap Card in your Deck. This Skill will only activate if you begin the Duel with a Deck that contains 3 or more Spell/Trap Cards with different names.",
  },
  {
    id: "draw-sense-low-level",
    name: "Draw Sense: Low-Level",
    character: "Yami Yugi",
    category: "robo",
    description:
      "Can be used before your normal draw each time your Life Points decrease by 1000. One of the cards from your normal draw this turn will be a random Level 4 or lower monster in your Deck.",
  },
  {
    id: "draw-sense-high-level",
    name: "Draw Sense: High-Level",
    character: "Seto Kaiba",
    category: "robo",
    description:
      "Can be used before your normal draw each time your Life Points decrease by 1000. One of the cards from your normal draw this turn will be a random Level 5 or higher monster in your Deck.",
  },
  {
    id: "draw-sense-dark",
    name: "Draw Sense: DARK",
    character: "Yami Bakura",
    category: "robo",
    description:
      "Can be used before your normal draw each time your Life Points decrease by 1500. One of the cards from your normal draw this turn will be a random DARK monster in your Deck.",
  },
  {
    id: "draw-sense-light",
    name: "Draw Sense: LIGHT",
    character: "Ishizu Ishtar",
    category: "robo",
    description:
      "Can be used before your normal draw each time your Life Points decrease by 1500. One of the cards from your normal draw this turn will be a random LIGHT monster in your Deck.",
  },
  {
    id: "draw-sense-water",
    name: "Draw Sense: WATER",
    character: "Mako Tsunami",
    category: "robo",
    description:
      "Can be used before your normal draw each time your Life Points decrease by 1500. One of the cards from your normal draw this turn will be a random WATER monster in your Deck.",
  },
  {
    id: "draw-sense-wind",
    name: "Draw Sense: WIND",
    character: "Mai Valentine",
    category: "robo",
    description:
      "Can be used before your normal draw each time your Life Points decrease by 1500. One of the cards from your normal draw this turn will be a random WIND monster in your Deck.",
  },
  {
    id: "draw-sense-earth",
    name: "Draw Sense: EARTH",
    character: "Joey Wheeler",
    category: "robo",
    description:
      "Can be used before your normal draw each time your Life Points decrease by 1500. One of the cards from your normal draw this turn will be a random EARTH monster in your Deck.",
  },
  {
    id: "draw-sense-fire",
    name: "Draw Sense: FIRE",
    character: "Rex Raptor",
    category: "robo",
    description:
      "Can be used before your normal draw each time your Life Points decrease by 1500. One of the cards from your normal draw this turn will be a random FIRE monster in your Deck.",
  },
  {
    id: "lp-boost-alpha",
    name: "LP Boost α",
    character: "Yami Yugi",
    category: "recuperacion",
    description:
      "Increases starting Life Points by 1000.",
  },
  {
    id: "lp-boost-beta",
    name: "LP Boost β",
    character: "Seto Kaiba",
    category: "recuperacion",
    description:
      "Increases starting Life Points by 1500, reduces hand by 1 card.",
  },
  {
    id: "lp-boost-gamma",
    name: "LP Boost γ",
    character: "Joey Wheeler",
    category: "recuperacion",
    description:
      "Increases starting Life Points by 2500, reduces hand by 2 cards.",
  },
  {
    id: "restart",
    name: "Restart",
    character: "Yugi Muto",
    category: "robo",
    description:
      "Can be used only once after starting hands are drawn. Reduce your starting hand by 1, and then redraw your hand. You cannot Special Summon or activate monster effects until the end of the Main Phase of your first turn.",
  },
  {
    id: "balance",
    name: "Balance",
    character: "Yami Yugi",
    category: "robo",
    description:
      "Your starting hand will reflect the card balance of your Deck. This Skill will not activate unless you have at least 6 of each type of card (Monster, Spell, and Trap) in your Deck. You cannot Special Summon or activate monster effects until the end of the Main Phase of your first turn.",
  },
  {
    id: "switcheroo",
    name: "Switcheroo",
    character: "Bandit Keith",
    category: "robo",
    description:
      "Can be used each time your Life Points decrease by 1000. Return 1 card in your hand to your Deck and draw another. This Skill can only be used once per turn and twice per Duel.",
  },
  {
    id: "its-a-toon-world",
    name: "It's a Toon World",
    character: "Maximillion Pegasus",
    category: "campo",
    description:
      "Begin Duel with the Continuous Spell Toon World activated.",
  },
  {
    id: "toonvitation",
    name: "Toonvitation",
    character: "Maximillion Pegasus",
    category: "invocacion",
    description:
      'During this Duel, you can Normal Summon/Set Toon monsters without Tributing. You can only Normal or Special Summon monsters that have 0 ATK, monsters that your opponent is the original owner of, or Toon monsters. You can also activate the following effect once per turn and twice per Duel. Return 1 card from your hand to the Deck, and add 1 "Toon World" to your hand from outside of your Deck.',
  },
  {
    id: "cyber-style",
    name: "Cyber Style",
    character: "Zane Truesdale",
    category: "fusion",
    description:
      'Can be used only once if your Life Points are at 2000 or below. For every 1000 Life Points below 4000, play 1 "Cyber Dragon" with 0 ATK from your hand or Deck to the field. You can only Special Summon "Cyber End Dragon" until the end of your opponent\'s next turn. "Cyber Dragon" played with this Skill cannot be Tributed, and while they are face-up on the field, you cannot Special Summon except for Fusion monsters, nor attack except with Fusion Monsters.',
  },
  {
    id: "power-of-dark",
    name: "Power of Dark",
    character: "Yami Yugi",
    category: "campo",
    description:
      'Begin Duel with the Field Spell "Yami" activated.',
  },
  {
    id: "peak-performance",
    name: "Peak Performance",
    character: "Seto Kaiba",
    category: "campo",
    description:
      'Begin Duel with the Field Spell "Mountain" activated.',
  },
  {
    id: "dinosaur-kingdom",
    name: "Dinosaur Kingdom",
    character: "Rex Raptor",
    category: "campo",
    description:
      'Begin Duel with the Field Spell "Jurassic World" activated.',
  },
  {
    id: "fields-of-the-warriors",
    name: "Fields of the Warriors",
    character: "Joey Wheeler",
    category: "campo",
    description:
      'Begin Duel with the Field Spell "Sogen" activated.',
  },
  {
    id: "straight-to-the-grave",
    name: "Straight to the Grave",
    character: "Bonz",
    category: "campo",
    description:
      'Begin Duel with the Field Spell "Wasteland" activated.',
  },
  {
    id: "luck-on-your-side",
    name: "Luck on Your Side",
    character: "Joey Wheeler",
    category: "especial",
    description:
      "If your Life Points drop below 1000, your coin tosses always land on heads.",
  },
  {
    id: "aroma-strategy",
    name: "Aroma Strategy",
    character: "Mai Valentine",
    category: "especial",
    description:
      "You can look at the card at the very top of your Deck at any time.",
  },
  {
    id: "shadow-game",
    name: "Shadow Game",
    character: "Yami Marik",
    category: "especial",
    description:
      'At the end of their respective turn, each player will lose Life Points equal to "100" times the number of cards in their own Graveyard.',
  },
  {
    id: "chain-reaction",
    name: "Chain Reaction",
    character: "Odion",
    category: "especial",
    description:
      "Your opponent loses 200 Life Points every time you activate a Trap Card.",
  },
  {
    id: "the-tie-that-binds",
    name: "The Tie that Binds",
    character: "Jaden Yuki",
    category: "ataque",
    description:
      "Until the end of your turn, the ATK of all face-up monsters on your field increases by the number of monsters on your field times 100. This Skill can only be used once per turn.",
  },
  {
    id: "spell-specialist",
    name: "Spell Specialist",
    character: "Yami Yugi",
    category: "robo",
    description:
      "If your Deck contains 5 or more Spell Cards with different names, you will have improved chances of having a Spell Card in your starting hand. You cannot Special Summon or activate monster effects until the end of the Main Phase of your first turn.",
  },
  {
    id: "trap-layer",
    name: "Trap Layer",
    character: "Odion",
    category: "robo",
    description:
      "If you have 5 or more Trap Cards with different names in your Deck, you will have an improved chance of having a Trap Card in your starting hand. You cannot Special Summon or activate monster effects until the end of the Main Phase of your first turn.",
  },
  {
    id: "fusion-time",
    name: "Fusion Time!",
    character: "Jaden Yuki",
    category: "fusion",
    description:
      'Can be used when your Life Points decrease by 1000. Return 1 card from your hand to your Deck and add "Polymerization" to your hand from outside of your Deck. Then, you can add 1 Level 4 or lower "Elemental HERO" Normal Monster to your hand from your Graveyard. This Skill can only be used once per Duel.',
  },
  {
    id: "miracle-fusion-time",
    name: "Miracle Fusion Time!",
    character: "Jaden Yuki",
    category: "fusion",
    description:
      'Can be used if your Life Points are at 500 or below. Instead of doing a normal draw, "Miracle Fusion" is added to your hand from outside of your Deck. This Skill can only be used once per Duel.',
  },
  {
    id: "dragonic-fusion",
    name: "Dragonic Fusion",
    character: "Chazz Princeton",
    category: "fusion",
    description:
      'At the beginning of the Duel, add 1 "Dragon\'s Mirror" to your Deck. Then, add 1 "Five-Headed Dragon" to your Extra Deck. This Skill can only be used once per Duel. Can be used if your Life Points decrease by 1500. Return 1 card from your hand to your Deck and add "Dragon\'s Mirror" to your hand from your Deck.',
  },
  {
    id: "master-of-fusion",
    name: "Master of Fusion",
    character: "Zane Truesdale",
    category: "fusion",
    description:
      'Can be used each time your Life Points decrease by 1000. Return 1 card from your hand to your Deck and add "Polymerization" to your hand from outside of your Deck. This Skill can only be used twice per Duel.',
  },
  {
    id: "favorite-duel",
    name: "Favorite Duel",
    character: "Jaden Yuki",
    category: "fusion",
    description:
      'Each of the following effects can be used once per turn if you begin the Duel with a Deck that contains at least 4 "Elemental HERO" Normal Monsters with different names. When this Skill is used, you can only Special Summon "Neos" monsters, "Elemental HERO Shining Flare Wingman", and "Elemental HERO Flame Wingman".',
  },
  {
    id: "tuning",
    name: "Tuning",
    character: "Yusei Fudo",
    category: "robo",
    description:
      'Can be used before your normal draw after your Life Points decrease by 1000. Instead of conducting your normal draw, add 1 "Synchron" Tuner Monster of your choice from your Deck to your hand. Then, send the top card of your Deck to the Graveyard. If you begin the Duel with a Deck (excluding Extra Deck) that contains 3 or more "Junk" Effect Monsters, you can send 1 "Speed Warrior" to your Graveyard from outside of your Deck. This Skill can only be used once per Duel.',
  },
  {
    id: "level-duplication",
    name: "Level Duplication",
    character: "Yusei Fudo",
    category: "invocacion",
    description:
      "Can be used when your Life Points are 3000 or lower, by revealing 1 monster card in your hand and selecting 1 monster on your field.",
  },
  {
    id: "storm-access",
    name: "Storm Access",
    character: "Playmaker and Ai",
    category: "invocacion",
    description:
      'At the beginning of the Duel, add 1 "Decode Talker" and 1 "Firewall Dragon" to your Extra Deck. The following effect can be used if your Life Points are at 1000 or below: Add 1 random "Code Talker" monster to your Extra Deck via a Data Storm. This Skill can only be used once per Duel.',
  },
  {
    id: "galaxy-photon",
    name: "Galaxy Photon",
    character: "Kite Tenjo",
    category: "invocacion",
    description:
      'Return 1 "Galaxy" or "Photon" monster from your hand to your Deck and add 1 "Galaxy" or "Photon" Spell/Trap Card from your Deck to your hand. This Skill can only be used if you begin the Duel with a Deck/Extra Deck that contains no monsters other than LIGHT monsters. This Skill can only be used once per Duel.',
  },
  {
    id: "sharks-revenge",
    name: "Shark's Revenge",
    character: 'Reginald "Shark" Kastle',
    category: "ataque",
    description:
      "Can be used when your Life Points are lower than your opponent's. Increase the ATK of Rank 4 or lower WATER Sea Serpent-Type Xyz Monster by 1500 per three Xyz Materials until the end of the turn. This Skill can only be used once per Duel.",
  },
  {
    id: "territory-of-the-sharks",
    name: "Territory of the Sharks",
    character: 'Reginald "Shark" Kastle',
    category: "ataque",
    description:
      "The Level of all WATER monsters you control becomes 4 until the end of the turn. This Skill can only be used if you begin the Duel with a Deck/Extra Deck that contains at least 1 monster, and no monsters other than WATER monsters. This Skill can only be used once per turn and twice per Duel.",
  },
  {
    id: "overlay-control",
    name: "Overlay Control",
    character: "Yuma and Astral",
    category: "invocacion",
    description:
      'This Skill\'s first effect can be used if your Extra Deck contains 5 or more Xyz Monsters. 1: At the beginning of your first turn, Set 1 "Overlay Network" from outside of your Deck to your field.',
  },
  {
    id: "smile-world",
    name: "Smile World",
    character: "Yuya Sakaki",
    category: "especial",
    description:
      'Add 1 "Smile World" to your hand from outside of your Deck. If you activate this Skill, you can only activate or use the effect of "Smile" Spell/Trap cards until the end of your opponent\'s next turn. This Skill can only be used once per Duel.',
  },
  {
    id: "pendulum-booster",
    name: "Pendulum Booster",
    character: "Sylvio Sawatari",
    category: "ataque",
    description:
      "If you have 2 cards in your Pendulum Zones, during your turn only, the ATK of all your monsters are increased by 50 multiplied by the number of highest Pendulum Scale of Pendulum Monster Cards in your Pendulum Zones.",
  },
  {
    id: "pendulum-change-basic",
    name: "Pendulum Change: Basic",
    character: "Yuya Sakaki",
    category: "invocacion",
    description:
      "At the beginning of the Duel, add Pendulum Zones to your field. In addition, the following effect can be used once per Duel. Return 1 Normal Monster Card in your Pendulum Zone to the Deck, and add 1 random Normal Monster with a different name from the Deck to your hand.",
  },
  {
    id: "swing-into-action-pendulum-summon",
    name: "Swing Into Action: Pendulum Summon!",
    character: "Yuya Sakaki",
    category: "invocacion",
    description:
      "At the beginning of the Duel, add Pendulum Zones to your field. The following effect can be used once per turn if you have a face-up Pendulum Monster in your Extra Deck. Select 1 monster you control in the Extra Monster Zone and move it to your Main Monster Zone in the same column.",
  },
  {
    id: "link-booster",
    name: "Link Booster",
    character: "Playmaker and Ai",
    category: "ataque",
    description:
      "Each Link Monster you control gains 100 ATK for each monster it currently points to.",
  },
  {
    id: "gravekeepers-lot",
    name: "Gravekeeper's Lot",
    character: "Ishizu Ishtar",
    category: "robo",
    description:
      "Can be used before your normal draw each time your Life Points decrease by 1000. One of the cards from your normal draw this turn will be a random \"Gravekeeper's\" card from your Deck.",
  },
];
