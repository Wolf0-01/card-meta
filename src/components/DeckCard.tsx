import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

interface DeckCardProps {
  name: string;
  tier: string;
  skill: string;
  author: string;
  description: string;
  slug?: string;
}

export default function DeckCard({
  name,
  tier,
  skill,
  author,
  description,
  slug,
}: DeckCardProps) {
  return (
    <Card className="flex flex-col">

      {/* Imagen */}
      <div
        className="
          flex
          h-32
          items-center
          justify-center
          bg-gradient-to-r
          from-primary/20
          via-surface
          to-primary/10
        "
      >
        <span className="text-4xl">
          🃏
        </span>
      </div>

      {/* Contenido */}
      <div className="flex flex-1 flex-col p-5">

        {/* Header */}
        <div className="flex items-center justify-between">

          <h3
            className="
              text-xl
              font-bold
              text-foreground
            "
          >
            {name}
          </h3>

          <span
            className="
              rounded-full
              bg-yellow-500/20
              px-3
              py-1
              text-xs
              font-semibold
              text-yellow-400
            "
          >
            {tier}
          </span>

        </div>

        {/* Descripción */}
        <p
          className="
            mt-3
            text-sm
            text-foreground-secondary
          "
        >
          {description}
        </p>

        {/* Información */}
        <div
          className="
            mt-4
            space-y-1
            text-sm
            text-foreground-secondary
          "
        >
          <p>
            ⚡ Skill: {skill}
          </p>

          <p>
            👤 Autor: {author}
          </p>
        </div>

        {/* Botón */}
        <div className="mt-5">
          <Button
            href={`/decks/${slug ?? name.toLowerCase()}`}
            fullWidth
          >
            Ver Deck
          </Button>
        </div>

      </div>

    </Card>
  );
}