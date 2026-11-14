"use client";

import Link from "next/link";

import { useEffect, useState } from "react";

interface MeResponse {
  user: {
    role: "USER" | "EDITOR" | "ADMIN";
  } | null;
}

/**
 * El enlace al panel de sincronización solo debe existir
 * para ADMIN. Se resuelve en cliente contra /api/auth/me
 * para no convertir todo el layout en dinámico.
 */
export default function AdminNavLink() {
  const [isAdmin, setIsAdmin] =
    useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const response = await fetch(
          "/api/auth/me",
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          return;
        }

        const data =
          (await response.json()) as MeResponse;

        if (active) {
          setIsAdmin(
            data.user?.role === "ADMIN"
          );
        }
      } catch {
        /*
         * El enlace es una ayuda visual: si falla la
         * petición, simplemente no se muestra.
         */
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, []);

  if (!isAdmin) {
    return null;
  }

  return (
    <Link
      href="/admin"
      className="
        hidden
        rounded-md
        border
        border-amber-400/30
        bg-amber-400/10
        px-2.5
        py-1.5
        text-[10px]
        font-black
        uppercase
        tracking-[0.14em]
        text-amber-200
        transition-colors
        hover:border-amber-300
        hover:text-amber-100
        lg:inline-flex
      "
    >
      Admin
    </Link>
  );
}
