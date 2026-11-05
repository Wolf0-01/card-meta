interface CardStatsProps {
  attribute?: string | null;

  race?: string | null;

  type?: string | null;

  archetype?: string | null;

  attack?: number | null;

  defense?: number | null;

  level?: number | null;

  rarity?: string | null;

  frameType?: string | null;

  ygoproId?: number | null;
}

function StatRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  return (
    <div
      className="
        flex
        items-center
        justify-between
        border-b
        border-zinc-800
        py-3
      "
    >
      <span
        className="
          text-sm
          text-zinc-400
        "
      >
        {label}
      </span>

      <span
        className="
          text-sm
          font-semibold
          text-white
        "
      >
        {value}
      </span>
    </div>
  );
}

export default function CardStats({
  attribute,
  race,
  type,
  archetype,
  attack,
  defense,
  level,
  rarity,
  frameType,
  ygoproId,
}: CardStatsProps) {
  return (
    <section
      className="
        rounded-2xl
        border
        border-zinc-800
        bg-zinc-900
        p-6
      "
    >
      <h2
        className="
          mb-5
          text-2xl
          font-bold
          text-white
        "
      >
        Card Information
      </h2>

      <StatRow
        label="Attribute"
        value={attribute}
      />

      <StatRow
        label="Race"
        value={race}
      />

      <StatRow
        label="Type"
        value={type}
      />

      <StatRow
        label="Archetype"
        value={archetype}
      />

      <StatRow
        label="Level"
        value={level}
      />

      <StatRow
        label="ATK"
        value={attack}
      />

      <StatRow
        label="DEF"
        value={defense}
      />

      <StatRow
        label="Rarity"
        value={rarity}
      />

      <StatRow
        label="Frame Type"
        value={frameType}
      />

      <StatRow
        label="YGOPRO ID"
        value={ygoproId}
      />
    </section>
  );
}