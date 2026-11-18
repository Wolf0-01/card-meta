"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface ArchetypeCardFilterValue {
  id: number;

  name: string;
}

interface ArchetypeCardFilterContextValue {
  selected: ArchetypeCardFilterValue | null;

  toggle: (card: ArchetypeCardFilterValue) => void;

  clear: () => void;
}

const ArchetypeCardFilterContext =
  createContext<ArchetypeCardFilterContextValue | null>(
    null
  );

/**
 * Estado compartido entre el Archetype Breakdown y la tabla
 * de mazos: la Core Card seleccionada filtra las filas que
 * incluyen esa carta.
 */
export function useArchetypeCardFilter() {
  return useContext(ArchetypeCardFilterContext);
}

export default function ArchetypeCardFilterProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [selected, setSelected] =
    useState<ArchetypeCardFilterValue | null>(null);

  const toggle = useCallback(
    (card: ArchetypeCardFilterValue) => {
      setSelected((current) =>
        current?.id === card.id ? null : card
      );
    },
    []
  );

  const clear = useCallback(() => {
    setSelected(null);
  }, []);

  const value = useMemo(
    () => ({
      selected,
      toggle,
      clear,
    }),
    [selected, toggle, clear]
  );

  return (
    <ArchetypeCardFilterContext.Provider
      value={value}
    >
      {children}
    </ArchetypeCardFilterContext.Provider>
  );
}
