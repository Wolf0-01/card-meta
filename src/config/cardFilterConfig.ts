export const cardFilterConfig = [

  {
    key: "type",
    label: "Card Type",
    options: [
      "Monster",
      "Spell",
      "Trap"
    ]
  },


  {
    key: "attribute",
    label: "Attribute",
    options: [
      "LIGHT",
      "DARK",
      "EARTH",
      "FIRE",
      "WATER",
      "WIND",
      "DIVINE"
    ]
  },


  {
    key: "rarity",
    label: "Rarity",
    options: [
      "N",
      "R",
      "SR",
      "UR"
    ]
  },


  {
    key: "monsterType",
    label: "Monster Type",
    options: [
      "Dragon",
      "Warrior",
      "Spellcaster",
      "Machine",
      "Zombie"
    ]
  },


  {
    key: "level",
    label: "Level",
    options:
      Array.from(
        { length: 12 },
        (_, i) => String(i + 1)
      )
  },


  {
    key: "scale",
    label: "Pendulum Scale",
    options:
      Array.from(
        { length: 14 },
        (_, i) => String(i)
      )
  }

];