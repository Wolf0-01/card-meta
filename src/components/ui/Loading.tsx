interface LoadingProps {
  text?: string;
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
}

const sizeVariants = {
  sm: "h-6 w-6 border-2",
  md: "h-10 w-10 border-[3px]",
  lg: "h-14 w-14 border-4",
};

export default function Loading({
  text = "Cargando...",
  size = "md",
  fullScreen = false,
}: LoadingProps) {
  return (
    <div
      className={`
        flex
        flex-col
        items-center
        justify-center
        gap-4
        ${
          fullScreen
            ? "min-h-screen"
            : "py-10"
        }
      `}
    >
      <div
        className={`
          animate-spin
          rounded-full
          border-blue-500
          border-t-transparent
          ${sizeVariants[size]}
        `}
      />

      <p
        className="
          text-sm
          text-zinc-400
        "
      >
        {text}
      </p>
    </div>
  );
}