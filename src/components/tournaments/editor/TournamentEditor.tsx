"use client";

import Link from "next/link";

import {
  useRouter,
} from "next/navigation";

import {
  useState,
} from "react";

import {
  ArrowLeft,
  CalendarDays,
  Loader2,
  Plus,
  Save,
  Swords,
  Trash2,
  Trophy,
} from "lucide-react";

import {
  getAchievementLabel,
  normalizeAchievement,
} from "@/lib/decks/achievements";

import type {
  TournamentDeckOption,
  TournamentEditorData,
} from "@/lib/tournaments/editor";

/**
 * Etiqueta compacta del selector de mazos:
 * `<Archetype> — <playerName || author> (<placement || achievement> · <skill>)`.
 */
function formatDeckOptionLabel(
  deck: TournamentDeckOption
): string {
  const archetype =
    deck.archetype?.trim() ||
    deck.name.trim() ||
    "Deck";

  const player =
    deck.playerName?.trim() ||
    deck.author?.trim() ||
    "Anonymous";

  const achievement = normalizeAchievement(
    deck.achievement
  );

  const result =
    deck.placement?.trim() ||
    getAchievementLabel(achievement);

  const skill = deck.skill?.trim();

  const details = skill
    ? `${result} · ${skill}`
    : result;

  return `${archetype} — ${player} (${details})`;
}

const labelClass = `
  block
  text-[9px]
  font-black
  uppercase
  tracking-[0.16em]
  text-slate-400
`;

const inputClass = `
  mt-1
  h-9
  w-full
  rounded-lg
  border
  border-slate-700/70
  bg-[#070D1F]
  px-2.5
  text-xs
  text-slate-200
  placeholder:text-slate-500
  outline-none
  transition-colors
  focus:border-blue-400/70
  focus:ring-1
  focus:ring-blue-400/30
`;

interface DraftStanding {
  key: string;

  player: string;

  archetype: string;

  deckId: string;
}

interface TournamentApiResponse {
  tournament?: {
    id: string;

    slug: string;
  };

  error?: string;

  issues?: {
    path: string;

    message: string;
  }[];
}

interface TournamentEditorProps {
  mode: "create" | "edit";

  initialTournament?: TournamentEditorData;

  deckOptions: TournamentDeckOption[];

  bannerOptions: string[];
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function toDraftStandings(
  tournament?: TournamentEditorData
): DraftStanding[] {
  if (
    !tournament ||
    tournament.standings.length === 0
  ) {
    return [
      {
        key: "standing-0",

        player: "",

        archetype: "",

        deckId: "",
      },
    ];
  }

  return tournament.standings.map(
    (standing, index) => ({
      key: `standing-${index}`,

      player: standing.player,

      archetype: standing.archetype,

      deckId: standing.deckId,
    })
  );
}

export default function TournamentEditor({
  mode,
  initialTournament,
  deckOptions,
  bannerOptions,
}: TournamentEditorProps) {
  const router = useRouter();

  const [name, setName] = useState(
    initialTournament?.name ?? ""
  );

  const [organizer, setOrganizer] = useState(
    initialTournament?.organizer ?? "Community"
  );

  const [format, setFormat] = useState(
    initialTournament?.format ?? "Speed Duel"
  );

  const [playerCount, setPlayerCount] =
    useState(
      String(initialTournament?.playerCount ?? 0)
    );

  const [date, setDate] = useState(
    initialTournament?.date ?? todayIsoDate()
  );

  const [bannerUrl, setBannerUrl] =
    useState(
      initialTournament?.bannerUrl ?? ""
    );

  const [description, setDescription] =
    useState(
      initialTournament?.description ?? ""
    );

  const [standings, setStandings] = useState<
    DraftStanding[]
  >(() => toDraftStandings(initialTournament));

  const [saving, setSaving] =
    useState(false);

  const [error, setError] = useState<
    string | null
  >(null);

  const isEdit = mode === "edit";

  function updateStanding(
    key: string,
    patch: Partial<DraftStanding>
  ) {
    setStandings((current) =>
      current.map((standing) =>
        standing.key === key
          ? {
              ...standing,
              ...patch,
            }
          : standing
      )
    );
  }

  function addStanding() {
    setStandings((current) => [
      ...current,

      {
        key: `standing-${Date.now()}-${current.length}`,

        player: "",

        archetype: "",

        deckId: "",
      },
    ]);
  }

  function removeStanding(key: string) {
    setStandings((current) =>
      current.length <= 1
        ? current
        : current.filter(
            (standing) =>
              standing.key !== key
          )
    );
  }

  async function handleSave() {
    if (saving) {
      return;
    }

    const cleanName = name.trim();

    const cleanOrganizer = organizer.trim();

    const cleanFormat = format.trim();

    const parsedPlayerCount = Number(
      playerCount
    );

    if (!cleanName) {
      setError("The name is required.");

      return;
    }

    if (!cleanOrganizer) {
      setError("The organizer is required.");

      return;
    }

    if (!cleanFormat) {
      setError("The format is required.");

      return;
    }

    if (
      !Number.isFinite(parsedPlayerCount) ||
      parsedPlayerCount < 0
    ) {
      setError(
        "The player count must be zero or more."
      );

      return;
    }

    const payloadStandings = standings.map(
      (standing, index) => ({
        rank: index + 1,

        player: standing.player.trim(),

        archetype:
          standing.archetype.trim(),

        deckId: standing.deckId || null,
      })
    );

    const invalidIndex =
      payloadStandings.findIndex(
        (standing) =>
          !standing.player ||
          !standing.archetype
      );

    if (invalidIndex >= 0) {
      setError(
        `Standing ${
          invalidIndex + 1
        } needs a player and an archetype.`
      );

      return;
    }

    setSaving(true);

    setError(null);

    try {
      const response = await fetch(
        isEdit && initialTournament
          ? `/api/tournaments/${initialTournament.id}`
          : "/api/tournaments",
        {
          method: isEdit ? "PATCH" : "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            name: cleanName,

            organizer: cleanOrganizer,

            format: cleanFormat,

            playerCount: parsedPlayerCount,

            date,

            bannerUrl: bannerUrl.trim(),

            description: description.trim(),

            standings: payloadStandings,
          }),
        }
      );

      const data = (await response
        .json()
        .catch(() => null)) as
        | TournamentApiResponse
        | null;

      if (!response.ok) {
        const issueText = Array.isArray(
          data?.issues
        )
          ? data.issues
              .map((issue) => issue.message)
              .join(" ")
          : "";

        throw new Error(
          [
            data?.error ??
              "Could not save the tournament.",
            issueText,
          ]
            .filter(Boolean)
            .join(" ")
        );
      }

      router.push("/tournaments");

      router.refresh();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Could not save the tournament."
      );

      setSaving(false);
    }
  }

  return (
    <main
      className="
        min-h-screen
        bg-[#070D1F]
        px-3
        py-5
        text-slate-100
        sm:px-6
        sm:py-7
      "
    >
      <div
        className="
          mx-auto
          w-full
          max-w-4xl
          space-y-4
        "
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Link
            href="/tournaments"
            className="
              inline-flex
              items-center
              gap-1
              text-[9px]
              font-black
              uppercase
              tracking-[0.18em]
              text-slate-500
              transition-colors
              hover:text-blue-300
            "
          >
            <ArrowLeft className="h-3 w-3" />
            Back to Tournaments
          </Link>
        </div>

        <header className="space-y-1.5">
          <p
            className="
              text-[9px]
              font-black
              uppercase
              tracking-[0.3em]
              text-blue-300
            "
          >
            {isEdit
              ? "Edit Tournament"
              : "New Tournament"}
          </p>

          <h1
            className="
              text-2xl
              font-black
              uppercase
              tracking-[0.14em]
              text-white
              sm:text-4xl
            "
          >
            {isEdit
              ? "Edit tournament"
              : "Add tournament"}
          </h1>

          <p
            className="
              max-w-2xl
              text-[11px]
              leading-relaxed
              text-slate-400
            "
          >
            Register a real tournament and link each
            placement to a public deck from the
            catalog.
          </p>
        </header>

        {error && (
          <div
            role="alert"
            className="
              rounded-lg
              border
              border-red-500/40
              bg-red-500/10
              px-3
              py-2.5
              text-[11px]
              leading-relaxed
              text-red-200
            "
          >
            {error}
          </div>
        )}

        <form
          onSubmit={(event) => {
            event.preventDefault();

            void handleSave();
          }}
          className="space-y-4"
        >
          <section
            className="
              rounded-xl
              border
              border-slate-700/60
              bg-[#0B132B]
              p-4
              ring-1
              ring-inset
              ring-white/5
            "
          >
            <div className="mb-3 flex items-center gap-2 border-b border-slate-800 pb-2">
              <Trophy className="h-3.5 w-3.5 text-blue-300" />

              <h2
                className="
                  text-[10px]
                  font-black
                  uppercase
                  tracking-[0.2em]
                  text-slate-200
                "
              >
                Event details
              </h2>
            </div>

            <div className="grid gap-3 lg:grid-cols-2">
              <label className="space-y-0.5 lg:col-span-2">
                <span className={labelClass}>
                  Name
                </span>

                <input
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="Community Clash #48"
                  className={inputClass}
                />
              </label>

              <label className="space-y-0.5">
                <span className={labelClass}>
                  Organizer
                </span>

                <input
                  type="text"
                  value={organizer}
                  onChange={(event) =>
                    setOrganizer(event.target.value)
                  }
                  placeholder="Community"
                  className={inputClass}
                />
              </label>

              <label className="space-y-0.5">
                <span className={labelClass}>
                  Format
                </span>

                <input
                  type="text"
                  value={format}
                  onChange={(event) =>
                    setFormat(event.target.value)
                  }
                  placeholder="Speed Duel"
                  className={inputClass}
                />
              </label>

              <label className="space-y-0.5">
                <span className={labelClass}>
                  Players
                </span>

                <input
                  type="number"
                  min={0}
                  value={playerCount}
                  onChange={(event) =>
                    setPlayerCount(
                      event.target.value
                    )
                  }
                  placeholder="64"
                  className={inputClass}
                />
              </label>

              <label className="space-y-0.5">
                <span className={labelClass}>
                  Date
                </span>

                <div className="relative">
                  <CalendarDays
                    aria-hidden
                    className="
                      pointer-events-none
                      absolute
                      left-2.5
                      top-1/2
                      z-10
                      mt-0.5
                      h-3.5
                      w-3.5
                      -translate-y-1/2
                      text-slate-500
                    "
                  />

                  <input
                    type="date"
                    value={date}
                    onChange={(event) =>
                      setDate(event.target.value)
                    }
                    className={`
                      ${inputClass}
                      pl-8
                    `}
                  />
                </div>
              </label>

              <label className="space-y-0.5 lg:col-span-2">
                <span className={labelClass}>
                  Banner URL (optional)
                </span>

                <input
                  type="text"
                  list="tournament-banner-options"
                  value={bannerUrl}
                  onChange={(event) =>
                    setBannerUrl(event.target.value)
                  }
                  placeholder="https://example.com/banner.webp or /banners/event-banner.png"
                  className={inputClass}
                />

                <datalist id="tournament-banner-options">
                  {bannerOptions.map((option) => (
                    <option
                      key={option}
                      value={option}
                    />
                  ))}
                </datalist>

                <span className="mt-1 block text-[9px] leading-relaxed text-slate-500">
                  Pick a banner already used by another
                  tournament, paste a public image URL or
                  use a local path such as
                  /banners/kc-cup-nov-2026.png.
                </span>

                {bannerUrl.trim() && (
                  <span className="mt-2 block overflow-hidden rounded-lg border border-slate-700/70 bg-[#070D1F]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={bannerUrl.trim()}
                      alt="Tournament banner preview"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="h-24 w-full object-cover"
                    />
                  </span>
                )}
              </label>

              <label className="space-y-0.5 lg:col-span-2">
                <span className={labelClass}>
                  Tournament information / notes
                  (optional)
                </span>

                <textarea
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  placeholder={
                    "Rules, stages, schedule or rewards.\nOne line per bullet, e.g.:\n• Stage 1: DLv. 1–15\n• Stage 2: DLv. MAX\n• Rewards: 500 gems + icon"
                  }
                  rows={5}
                  maxLength={4000}
                  className={`
                    ${inputClass}
                    min-h-[120px]
                    resize-y
                    py-2
                    leading-relaxed
                  `}
                />

                <span className="mt-1 block text-[9px] leading-relaxed text-slate-500">
                  Shown on the public tournament page. Line
                  breaks and bullet points are preserved.
                </span>
              </label>
            </div>
          </section>

          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Swords className="h-3.5 w-3.5 text-blue-300" />

              <h2
                className="
                  text-[10px]
                  font-black
                  uppercase
                  tracking-[0.2em]
                  text-slate-200
                "
              >
                Standings
              </h2>

              <span
                className="
                  rounded
                  border
                  border-slate-700/70
                  bg-[#0B132B]
                  px-1.5
                  py-0.5
                  text-[8px]
                  font-black
                  tabular-nums
                  text-slate-500
                "
              >
                {standings.length}
              </span>
            </div>

            <button
              type="button"
              onClick={addStanding}
              className="
                inline-flex
                h-8
                items-center
                gap-1.5
                rounded-lg
                border
                border-blue-500/40
                bg-blue-500/10
                px-3
                text-[9px]
                font-black
                uppercase
                tracking-[0.14em]
                text-blue-200
                transition-colors
                hover:border-blue-400
                hover:bg-blue-500/20
                hover:text-white
              "
            >
              <Plus className="h-3.5 w-3.5" />
              Add placement
            </button>
          </div>

          <div className="space-y-2">
            {standings.map(
              (standing, index) => (
                <div
                  key={standing.key}
                  className="
                    grid
                    gap-2
                    rounded-xl
                    border
                    border-slate-700/60
                    bg-[#0B132B]
                    p-3
                    ring-1
                    ring-inset
                    ring-white/5
                    lg:grid-cols-[auto_1fr_1fr_1.4fr_auto]
                    lg:items-end
                  "
                >
                  <span
                    aria-hidden
                    className="
                      hidden
                      h-9
                      w-9
                      items-center
                      justify-center
                      rounded-lg
                      border
                      border-amber-400/30
                      bg-amber-400/10
                      text-[10px]
                      font-black
                      tabular-nums
                      text-amber-200
                      lg:flex
                    "
                  >
                    {index + 1}
                  </span>

                  <label className="space-y-0.5">
                    <span className={labelClass}>
                      Player
                    </span>

                    <input
                      type="text"
                      value={standing.player}
                      onChange={(event) =>
                        updateStanding(
                          standing.key,
                          {
                            player:
                              event.target.value,
                          }
                        )
                      }
                      placeholder="Player name"
                      className={inputClass}
                    />
                  </label>

                  <label className="space-y-0.5">
                    <span className={labelClass}>
                      Archetype
                    </span>

                    <input
                      type="text"
                      value={standing.archetype}
                      onChange={(event) =>
                        updateStanding(
                          standing.key,
                          {
                            archetype:
                              event.target.value,
                          }
                        )
                      }
                      placeholder="Snake-Eye"
                      className={inputClass}
                    />
                  </label>

                  <label className="space-y-0.5">
                    <span className={labelClass}>
                      Public deck (optional)
                    </span>

                    <select
                      value={standing.deckId}
                      onChange={(event) =>
                        updateStanding(
                          standing.key,
                          {
                            deckId:
                              event.target.value,
                          }
                        )
                      }
                      className={inputClass}
                    >
                      <option value="">
                        No linked deck
                      </option>

                      {deckOptions.map((deck) => (
                        <option
                          key={deck.id}
                          value={deck.id}
                        >
                          {formatDeckOptionLabel(deck)}
                        </option>
                      ))}
                    </select>
                  </label>

                  <button
                    type="button"
                    onClick={() =>
                      removeStanding(
                        standing.key
                      )
                    }
                    disabled={
                      standings.length <= 1
                    }
                    aria-label={`Remove placement ${
                      index + 1
                    }`}
                    title={
                      standings.length <= 1
                        ? "The tournament needs at least one placement"
                        : "Remove placement"
                    }
                    className="
                      flex
                      h-9
                      w-9
                      shrink-0
                      items-center
                      justify-center
                      rounded-lg
                      border
                      border-slate-700/70
                      bg-[#070D1F]
                      text-slate-500
                      transition-colors
                      hover:border-red-500/50
                      hover:text-red-300
                      disabled:cursor-not-allowed
                      disabled:opacity-30
                    "
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )
            )}
          </div>

          <div
            className="
              sticky
              bottom-3
              z-10
              flex
              flex-wrap
              items-center
              justify-between
              gap-2
              rounded-xl
              border
              border-slate-700/70
              bg-[#0B132B]/95
              p-2.5
              shadow-[0_16px_40px_-20px_rgba(0,0,0,0.9)]
              backdrop-blur
            "
          >
            <p className="text-[10px] leading-relaxed text-slate-500">
              Placements are sorted by rank. Only public
              decks can be linked.
            </p>

            <div className="flex items-center gap-2">
              <Link
                href="/tournaments"
                className="
                  inline-flex
                  h-8
                  items-center
                  rounded-lg
                  border
                  border-slate-700/70
                  bg-[#070D1F]
                  px-3
                  text-[9px]
                  font-black
                  uppercase
                  tracking-[0.14em]
                  text-slate-300
                  transition-colors
                  hover:border-slate-500
                  hover:text-white
                "
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={saving}
                className="
                  inline-flex
                  h-8
                  items-center
                  gap-1.5
                  rounded-lg
                  border
                  border-emerald-500/40
                  bg-emerald-500/15
                  px-3
                  text-[9px]
                  font-black
                  uppercase
                  tracking-[0.14em]
                  text-emerald-200
                  transition-colors
                  hover:border-emerald-400
                  hover:bg-emerald-500/25
                  hover:text-white
                  disabled:cursor-wait
                  disabled:opacity-60
                "
              >
                {saving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}

                {saving
                  ? "Saving..."
                  : isEdit
                    ? "Save changes"
                    : "Publish tournament"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
