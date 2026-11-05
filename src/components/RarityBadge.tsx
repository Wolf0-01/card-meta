interface RarityBadgeProps {
  rarity: string | null;
}


export default function RarityBadge({
  rarity,
}: RarityBadgeProps) {

  const colors = {
    UR: "bg-yellow-400 text-black shadow-yellow-400/50",
    SR: "bg-gray-300 text-black shadow-gray-300/50",
    R: "bg-blue-500 text-white shadow-blue-500/50",
    N: "bg-zinc-700 text-white",
  };


  const style =
    colors[rarity as keyof typeof colors] ??
    colors.N;


  return (
    <span
      className={`
        px-4
        py-2
        rounded-full
        font-bold
        shadow-lg
        ${style}
      `}
    >
      {rarity ?? "N"}
    </span>
  );
}