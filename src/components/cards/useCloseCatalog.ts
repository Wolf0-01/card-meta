"use client";

import {
  useCallback,
} from "react";

import {
  useRouter,
} from "next/navigation";

/**
 * Cierre del catálogo modal.
 *
 * Vuelve a la página anterior cuando existe un referente
 * real y, si el catálogo se abrió directamente, navega al
 * inicio para no terminar en una pestaña vacía.
 */
export function useCloseCatalog() {
  const router = useRouter();

  return useCallback(() => {
    const hasReferrer =
      document.referrer.trim().length > 0;

    if (
      hasReferrer &&
      window.history.length > 1
    ) {
      router.back();

      return;
    }

    router.push("/");
  }, [router]);
}
