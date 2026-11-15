import type { Metadata } from "next";

import Link from "next/link";

import { notFound } from "next/navigation";

import { ArrowLeft, LayoutGrid } from "lucide-react";

import Container from "@/components/ui/Container";

import PublicDeckCard from "@/components/decks/PublicDeckCard";

import { getPublicUserProfile } from "@/lib/users/profile";

interface Props {
  params: Promise<{
    username: string;
  }>;
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { username } = await params;

  const profile =
    await getPublicUserProfile(username);

  if (!profile) {
    return {
      title: "Player not found | Card Meta",
    };
  }

  const name =
    profile.user.displayName?.trim() ||
    profile.user.username;

  return {
    title: `${name} (@${profile.user.username}) | Card Meta`,

    description: `Public decks shared by ${name} on Card Meta.`,
  };
}

const ROLE_BADGES: Record<
  string,
  {
    label: string;
    className: string;
  }
> = {
  ADMIN: {
    label: "Admin",
    className:
      "border-amber-400/40 bg-amber-400/10 text-amber-200",
  },

  EDITOR: {
    label: "Editor",
    className:
      "border-emerald-400/40 bg-emerald-400/10 text-emerald-200",
  },
};

export default async function UserProfilePage({
  params,
}: Props) {
  const { username } = await params;

  const profile =
    await getPublicUserProfile(username);

  if (!profile) {
    notFound();
  }

  const { user, decks } = profile;

  const displayName =
    user.displayName?.trim() ||
    user.username;

  const initials = displayName
    .slice(0, 2)
    .toUpperCase();

  const roleBadge = ROLE_BADGES[user.role];

  return (
    <main
      className="
        min-h-screen
        bg-[#070D1F]
        px-3
        py-6
        text-slate-100
        sm:px-6
        sm:py-8
      "
    >
      <Container size="xl">
        <Link
          href="/decks"
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
          Back to decks
        </Link>

        <div
          className="
            mt-4
            grid
            gap-4
            lg:grid-cols-[280px_minmax(0,1fr)]
            lg:items-start
          "
        >
          <aside
            className="
              rounded-2xl
              border
              border-slate-700/60
              bg-[#0B132B]
              p-5
              ring-1
              ring-inset
              ring-white/5
              lg:sticky
              lg:top-24
            "
          >
            <div className="flex flex-col items-center text-center">
              <div
                className="
                  flex
                  h-24
                  w-24
                  shrink-0
                  items-center
                  justify-center
                  overflow-hidden
                  rounded-full
                  border
                  border-slate-600
                  bg-slate-800
                  text-xl
                  font-black
                  text-slate-300
                  shadow-[0_0_30px_rgba(59,130,246,0.2)]
                "
              >
                {user.avatarUrl ? (
                  // El avatar puede ser una URL externa o un preset.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatarUrl}
                    alt={displayName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>

              <h1 className="mt-3 text-lg font-black text-white">
                {displayName}
              </h1>

              <p className="text-xs text-slate-500">
                @{user.username}
              </p>

              {roleBadge && (
                <span
                  className={`
                    mt-2
                    inline-flex
                    items-center
                    rounded
                    border
                    px-2
                    py-0.5
                    text-[8px]
                    font-black
                    uppercase
                    tracking-[0.16em]
                    ${roleBadge.className}
                  `}
                >
                  {roleBadge.label}
                </span>
              )}
            </div>

            <div
              className="
                mt-5
                flex
                items-center
                justify-between
                border-t
                border-slate-800
                pt-3
                text-[10px]
                font-bold
                uppercase
                tracking-[0.14em]
                text-slate-500
              "
            >
              <span>Decks played</span>

              <span className="tabular-nums text-slate-300">
                {decks.length}
              </span>
            </div>
          </aside>

          <section
            aria-label={`Decks played by ${displayName}`}
            className="
              rounded-2xl
              border
              border-slate-700/60
              bg-[#0B132B]
              p-4
              ring-1
              ring-inset
              ring-white/5
            "
          >
            <div
              className="
                flex
                items-center
                justify-between
                gap-2
                border-b
                border-slate-800
                pb-2
              "
            >
              <div className="flex items-center gap-2">
                <LayoutGrid className="h-3.5 w-3.5 text-blue-300" />

                <h2
                  className="
                    text-[10px]
                    font-black
                    uppercase
                    tracking-[0.2em]
                    text-slate-200
                  "
                >
                  Decks Played
                </h2>
              </div>

              <span
                className="
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-[0.14em]
                  text-slate-500
                "
              >
                {decks.length}{" "}
                {decks.length === 1
                  ? "deck"
                  : "decks"}
              </span>
            </div>

            {decks.length > 0 ? (
              <div
                className="
                  mt-3
                  grid
                  gap-2
                  sm:grid-cols-2
                "
              >
                {decks.map((deck) => (
                  <PublicDeckCard
                    key={deck.id}
                    deck={deck}
                  />
                ))}
              </div>
            ) : (
              <p
                className="
                  mt-4
                  rounded-xl
                  border
                  border-dashed
                  border-slate-700
                  px-4
                  py-8
                  text-center
                  text-xs
                  text-slate-500
                "
              >
                This player has not published any
                decks yet.
              </p>
            )}
          </section>
        </div>
      </Container>
    </main>
  );
}
