import Card from "@/components/ui/Card";

interface DeckGuideProps {
  guide?: string | null;
}

export default function DeckGuide({
  guide,
}: DeckGuideProps) {
  return (
    <Card className="p-6">

      <h2
        className="
          text-2xl
          font-bold
          text-foreground
        "
      >
        Deck Guide
      </h2>

      <div
        className="
          mt-4
          prose
          prose-invert
          max-w-none
          text-foreground-secondary
        "
      >
        {guide ? (
          <p>{guide}</p>
        ) : (
          <p>
            No guide is available for this deck yet.
          </p>
        )}
      </div>

    </Card>
  );
}