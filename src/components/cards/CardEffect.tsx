interface CardEffectProps {
  description?: string | null;
}

export default function CardEffect({
  description,
}: CardEffectProps) {
  if (!description) {
    return null;
  }

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
          mb-4
          text-2xl
          font-bold
          text-white
        "
      >
        Card Effect
      </h2>

      <div
        className="
          whitespace-pre-line
          leading-7
          text-zinc-300
        "
      >
        {description}
      </div>
    </section>
  );
}