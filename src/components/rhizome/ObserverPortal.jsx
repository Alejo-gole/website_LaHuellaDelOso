import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "motion/react";
import { PORTFOLIO_URL } from "../../data/portfolioData.js";
import { EASE_FLUIDO } from "../../motion/animations.js";

/* ============================================================
   ObserverPortal · Portal oculto hacia el portafolio profesional
   Un nodo diminuto y discreto («El Observador») escondido en una
   esquina del mapa. Es un <a> normal hacia PORTFOLIO_URL: al
   activarlo (clic o Enter) la pantalla se funde a negro y luego
   navega. Con reduced-motion navega sin fundido. Ctrl/Cmd/Shift-clic
   o clic central conservan el comportamiento nativo del enlace.
   · onClick puede devolver false para cancelar (p. ej. tras un arrastre).
   · stacked: en la lista móvil no usa coordenadas.
   ============================================================ */

const toCss = (v) => (typeof v === "number" ? `${v}%` : v);

export default function ObserverPortal({ href = PORTFOLIO_URL, xPos = 96, yPos = 95, stacked = false, onClick }) {
  const reduceMotion = useReducedMotion();
  const [leaving, setLeaving] = useState(false);

  // Al volver con "Atrás" el navegador puede restaurar la página en negro: se retira el fundido
  useEffect(() => {
    const reset = (event) => event.persisted && setLeaving(false);
    window.addEventListener("pageshow", reset);
    return () => window.removeEventListener("pageshow", reset);
  }, []);

  const handleClick = (event) => {
    if (onClick?.(event) === false) {
      event.preventDefault();
      return;
    }
    if (reduceMotion || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    setLeaving(true);
  };

  const position = stacked ? undefined : { left: toCss(xPos), top: toCss(yPos) };

  return (
    <>
      <a
        href={href}
        onClick={handleClick}
        aria-label="El Observador: ir al portafolio profesional"
        style={position}
        className={`group flex min-h-11 items-center whitespace-nowrap gap-2 rounded-full px-3 py-2 font-sans text-[0.625rem] tracking-[0.28em] text-ink-muted uppercase opacity-40 transition-opacity duration-500 hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
          stacked ? "mx-auto w-max" : "absolute -translate-x-1/2 -translate-y-1/2"
        }`}
      >
        <span aria-hidden="true" className="relative grid size-3 place-items-center">
          <span className="absolute inset-0 rounded-full bg-accent opacity-60 motion-safe:animate-ping" />
          <span className="size-1.5 rounded-full bg-accent" />
        </span>
        El Observador
      </a>

      {leaving &&
        createPortal(
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, ease: EASE_FLUIDO }}
            onAnimationComplete={() => window.location.assign(href)}
            // Negro puro a propósito: el tema reinicia la paleta (--color-*: initial) y no trae bg-black
            style={{ backgroundColor: "#000" }}
            className="fixed inset-0 z-[100]"
          />,
          document.body
        )}
    </>
  );
}
