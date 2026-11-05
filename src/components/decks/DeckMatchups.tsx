import Card from "@/components/ui/Card";

interface Matchup {
  deck: string;
  winRate: number;
}

interface DeckMatchupsProps {
  matchups?: Matchup[];
}

function getWinRateColor(winRate: number) {
  if (winRate >= 60) return "text-green-400";
  if (winRate >= 45) return "text-yellow-400";
  return "text-red-400";
}

export default function DeckMatchups({
  matchups = [],
}: DeckMatchupsProps) {
  return (
    <Card className="p-6">

      <h2 className="text-2xl font-bold text-foreground">
        Matchups
      </h2>

      {matchups.length > 0 ? (
        <div className="mt-6 space-y-3">

          {matchups.map((matchup) => (
            <div
              key={matchup.deck}
              className="
                flex
                items-center
                justify-between
                rounded-lg
                border
                border-border
                bg-surface
                px-4
                py-3
              "
            >
              <span className="font-medium text-foreground">
                {matchup.deck}
              </span>

              <span
                className={`
                  font-bold
                  ${getWinRateColor(matchup.winRate)}
                `}
              >
                {matchup.winRate}%
              </span>
            </div>
          ))}

        </div>
      ) : (
        <p className="mt-4 text-sm text-foreground-muted">
          No existen estadísticas de enfrentamientos.
        </p>
      )}

    </Card>
  );
}