"use client";

import Image from "next/image";

interface Props {
  image?: string | null;

  name: string;

  priority?: boolean;
}

export default function CardPreview({
  image,
  name,
  priority = false,
}: Props) {
  return (
    <div
      className="
        relative
        h-[165px]
        w-full
        overflow-hidden
        rounded-lg
        bg-zinc-800
      "
    >
      <Image
        src={
          image ??
          "/cards/default.jpg"
        }
        alt={name}
        fill
        sizes="115px"
        priority={priority}
        className="
          object-cover
        "
      />
    </div>
  );
}