export function getCardFrameColor(
  type?: string | null
) {
  const value =
    type?.toLowerCase() ?? "";

  if (value.includes("spell")) {
    return "border-emerald-500";
  }

  if (value.includes("trap")) {
    return "border-fuchsia-500";
  }

  if (value.includes("fusion")) {
    return "border-violet-500";
  }

  if (value.includes("synchro")) {
    return "border-slate-200";
  }

  if (value.includes("xyz")) {
    return "border-zinc-900";
  }

  if (value.includes("link")) {
    return "border-sky-500";
  }

  if (value.includes("ritual")) {
    return "border-cyan-500";
  }

  return "border-amber-600";
}

export function getAttributeColor(
  attribute?: string | null
) {
  switch (
    attribute?.toUpperCase()
  ) {
    case "LIGHT":
      return "bg-yellow-400 text-black";

    case "DARK":
      return "bg-purple-700 text-white";

    case "FIRE":
      return "bg-red-600 text-white";

    case "WATER":
      return "bg-blue-600 text-white";

    case "EARTH":
      return "bg-amber-700 text-white";

    case "WIND":
      return "bg-emerald-600 text-white";

    case "DIVINE":
      return "bg-pink-500 text-white";

    default:
      return "bg-zinc-700 text-white";
  }
}

export function getRarityColor(
  rarity?: string | null
) {
  switch (
    rarity?.toUpperCase()
  ) {
    case "UR":
      return "bg-yellow-500 text-black";

    case "SR":
      return "bg-purple-600 text-white";

    case "R":
      return "bg-blue-600 text-white";

    case "N":
      return "bg-zinc-600 text-white";

    default:
      return "bg-zinc-700 text-white";
  }
}