"use client";

import {
  type ReactNode,
} from "react";

import { useCloseCatalog } from "./useCloseCatalog";

interface CatalogDialogProps {
  children: ReactNode;
}

/**
 * Contenedor modal del catálogo.
 *
 * Cierra el catálogo al pulsar el fondo oscuro exterior.
 * Los clics dentro del panel no lo cierran porque el
 * objetivo del evento es un descendiente, no el fondo.
 */
export default function CatalogDialog({
  children,
}: CatalogDialogProps) {
  const closeCatalog = useCloseCatalog();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Card catalog"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          closeCatalog();
        }
      }}
      className="
        fixed
        inset-0
        z-[80]
        flex
        items-center
        justify-center
        overflow-hidden
        bg-black/55
        p-3
        text-slate-100
        sm:p-6
      "
    >
      <div
        aria-hidden
        className="
          pointer-events-none
          absolute
          inset-0
          bg-[radial-gradient(circle_at_50%_-10%,rgba(37,99,235,0.18),transparent_55%),radial-gradient(circle_at_90%_90%,rgba(14,165,233,0.08),transparent_45%)]
        "
      />

      {children}
    </div>
  );
}
