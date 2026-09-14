import { useSyncExternalStore } from "react";

const lists = new Map<string, MediaQueryList>();

function listFor(query: string): MediaQueryList {
  let list = lists.get(query);
  if (!list) {
    list = window.matchMedia(query);
    lists.set(query, list);
  }
  return list;
}

/**
 * Assina uma media query do CSS ("(min-width: 1024px)").
 *
 * Serve para o que não dá para resolver só com classe do Tailwind: quando celular
 * e computador precisam montar árvores diferentes (a coluna lateral da ficha vira
 * gaveta no celular) e renderizar as duas duplicaria o estado dos painéis.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = listFor(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    () => listFor(query).matches,
    () => false,
  );
}
