"use client";

import { useState } from "react";

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
  const [failed, setFailed] = useState(false);

  const src =
    failed || !image
      ? "/cards/default.jpg"
      : image;

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
        src={src}
        alt={name}
        fill
        sizes="115px"
        priority={priority}
        unoptimized={failed}
        onError={() => setFailed(true)}
        className="
          object-cover
        "
      />
    </div>
  );
}