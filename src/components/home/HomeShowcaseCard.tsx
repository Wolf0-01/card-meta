import Link from "next/link";

import {
  ArrowUpRight,
} from "lucide-react";

interface HomeShowcaseCardProps {
  title: string;

  subtitle: string;

  href: string;

  image: string | null;
}

/**
 * Si la URL proviene de YGOPRODeck (/cards/ o /cards_small/),
 * devuelve la versión /cards_cropped/ en HD (arte limpio sin marcos)
 * para evitar escalar píxeles y mantener máxima nitidez.
 */
function resolveShowcaseArtwork(url: string | null): {
  src: string | null;
  isCroppedArt: boolean;
} {
  if (!url) {
    return { src: null, isCroppedArt: false };
  }

  if (url.includes("://ygoprodeck.com")) {
    return { src: url, isCroppedArt: true };
  }

  if (
    url.includes("://ygoprodeck.com") ||
    url.includes("://ygoprodeck.com")
  ) {
    const cropped = url
      .replace("/images/cards_small/", "/images/cards_cropped/")
      .replace("/images/cards/", "/images/cards_cropped/");
    return { src: cropped, isCroppedArt: true };
  }

  return { src: url, isCroppedArt: false };
}

/**
 * Tarjeta ilustrada grande de la portada.
 */
export default function HomeShowcaseCard({
  title,
  subtitle,
  href,
  image,
}: HomeShowcaseCardProps) {
  const { src, isCroppedArt } = resolveShowcaseArtwork(image);

  return (
    <Link
      href={href}
      className="
        group
        relative
        flex
        min-h-[168px]
        flex-col
        justify-end
        overflow-hidden
        rounded-2xl
        border
        border-slate-700/60
        bg-[#0B132B]
        p-3.5
        shadow-[0_12px_36px_-24px_rgba(0,0,0,0.95)]
        ring-1
        ring-inset
        ring-white/5
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:border-blue-400/70
        hover:shadow-[0_0_34px_rgba(59,130,246,0.22)]
        sm:min-h-[190px]
        sm:p-4
      "
    >
      {src ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt=""
            loading="lazy"
            referrerPolicy="no-referrer"
            className={
              isCroppedArt
                ? "absolute inset-0 h-full w-full object-cover object-[50%_28%] opacity-90 transition-transform duration-300 group-hover:scale-105 group-hover:opacity-100"
                : "absolute inset-0 h-full w-full scale-[1.24] object-cover object-[50%_24%] opacity-90 transition-transform duration-300 group-hover:scale-[1.30] group-hover:opacity-100"
            }
          />

          <span
            aria-hidden
            className="
              absolute
              inset-0
              bg-gradient-to-t
              from-slate-950
              via-slate-950/50
              to-transparent
            "
          />
        </>
      ) : (
        <span
          aria-hidden
          className="
            absolute
            inset-0
            bg-[radial-gradient(circle_at_20%_0%,rgba(37,99,235,0.35),transparent_60%),radial-gradient(circle_at_90%_100%,rgba(14,165,233,0.2),transparent_55%)]
          "
        />
      )}

      <span
        aria-hidden
        className="
          absolute
          inset-0
          bg-slate-950/10
        "
      />

      <span
        aria-hidden
        className="
          absolute
          right-3
          top-3
          flex
          h-6
          w-6
          items-center
          justify-center
          rounded-full
          border
          border-white/10
          bg-slate-950/50
          text-slate-300
          opacity-0
          transition-opacity
          duration-200
          group-hover:opacity-100
        "
      >
        <ArrowUpRight className="h-3.5 w-3.5" />
      </span>

      <span className="relative">
        <span
          className="
            block
            text-base
            font-black
            uppercase
            leading-tight
            tracking-[0.06em]
            text-white
            sm:text-lg
          "
        >
          {title}
        </span>

        <span
          className="
            mt-1
            block
            text-[9px]
            font-bold
            uppercase
            tracking-[0.18em]
            text-slate-300
          "
        >
          {subtitle}
        </span>
      </span>
    </Link>
  );
}
