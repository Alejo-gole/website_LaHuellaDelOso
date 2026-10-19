import { useSyncExternalStore } from "react";

/* useMediaQuery · Suscripción reactiva a una media query (SSR-safe) */
export default function useMediaQuery(query) {
  return useSyncExternalStore(
    (notify) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", notify);
      return () => mql.removeEventListener("change", notify);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}

// Mismo corte que el breakpoint `md` de Tailwind
export const DESKTOP_QUERY = "(min-width: 48rem)";
