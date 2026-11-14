import Card from "@/components/ui/Card";

interface DeckCombosProps {
  combos?: string[] | null;
}

export default function DeckCombos({
  combos,
}: DeckCombosProps) {
  return (
    <Card className="p-6">

      <h2
        className="
          text-2xl
          font-bold
          text-foreground
        "
      >
        Main Combos
      </h2>

      {combos && combos.length > 0 ? (
        <ol
          className="
            mt-5
            space-y-3
            list-decimal
            pl-5
            text-foreground-secondary
          "
        >
          {combos.map((combo, index) => (
            <li key={index}>{combo}</li>
          ))}
        </ol>
      ) : (
        <p
          className="
            mt-4
            text-sm
            text-foreground-muted
          "
        >
          No combos registered for this deck.
        </p>
      )}

    </Card>
  );
}