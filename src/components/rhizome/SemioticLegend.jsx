import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Headphones, Layers, VolumeX, X } from "lucide-react";
import { SIGNS, SIGN_ORDER } from "../../data/ontology.js";
import { setListening, useListening } from "../../audio/soundCues.js";
import useMediaQuery, { DESKTOP_QUERY } from "../../hooks/useMediaQuery.js";
import { EASE_FLUIDO } from "../../motion/animations.js";

/* ============================================================
   SemioticLegend · Capas del territorio
   Alternar una capa es una arista más: el usuario decide qué
   signos ve (índices, íconos, símbolos) y si escucha. Las capas
   apagadas atenúan sus raíces y los nodos que significan así.
   · Escritorio: flotante abajo a la izquierda, siempre abierta.
   · Móvil: una píldora «Capas» (44px) abajo a la izquierda que
     despliega la leyenda sobre el mapa; así el lienzo queda libre
     para el pulgar.
   ============================================================ */

export default function SemioticLegend({ hiddenSigns, onToggleSign }) {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const [expanded, setExpanded] = useState(false);

  if (isDesktop) {
    return (
      <motion.nav
        aria-label="Capas del territorio"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE_FLUIDO, delay: 0.6 }}
        className="card-glass absolute bottom-8 left-8 z-10 w-72 p-4"
      >
        <LegendBody hiddenSigns={hiddenSigns} onToggleSign={onToggleSign} />
      </motion.nav>
    );
  }

  return (
    <div className="absolute bottom-[max(1rem,env(safe-area-inset-bottom))] left-4 z-10 flex flex-col items-start gap-2">
      <AnimatePresence>
        {expanded && (
          <motion.nav
            id="capas-territorio"
            aria-label="Capas del territorio"
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.3, ease: EASE_FLUIDO }}
            style={{ transformOrigin: "bottom left" }}
            className="card-glass w-[min(18rem,calc(100vw-2rem))] p-4"
          >
            <LegendBody hiddenSigns={hiddenSigns} onToggleSign={onToggleSign} />
          </motion.nav>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        aria-expanded={expanded}
        aria-controls="capas-territorio"
        onClick={() => setExpanded((v) => !v)}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        whileTap={{ scale: 0.94 }}
        transition={{ duration: 0.5, ease: EASE_FLUIDO }}
        className="card-glass flex min-h-11 items-center gap-2 rounded-full! px-4 font-sans text-sm text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {expanded ? (
          <X className="size-4" strokeWidth={1.75} aria-hidden="true" />
        ) : (
          <Layers className="size-4 text-accent" strokeWidth={1.75} aria-hidden="true" />
        )}
        Capas
      </motion.button>
    </div>
  );
}

function LegendBody({ hiddenSigns, onToggleSign }) {
  const listening = useListening();

  return (
    <>
      <p className="font-sans text-xs tracking-[0.24em] text-ink-muted uppercase">Capas · cómo significa</p>
      <ul className="mt-3 flex flex-col gap-1.5">
        {SIGN_ORDER.map((id) => {
          const sign = SIGNS[id];
          const visible = !hiddenSigns.has(id);
          return (
            <li key={id}>
              <button
                type="button"
                aria-pressed={visible}
                onClick={() => onToggleSign(id)}
                title={sign.hint}
                className="flex min-h-11 w-full items-center gap-3 rounded-xl px-2 py-1.5 text-left md:min-h-0 transition-colors hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-accent"
              >
                <svg viewBox="0 0 32 8" aria-hidden="true" className="h-2 w-8 shrink-0" style={{ color: sign.color }}>
                  <line
                    x1="1"
                    y1="4"
                    x2="31"
                    y2="4"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeDasharray={sign.dash}
                    opacity={visible ? 1 : 0.3}
                  />
                </svg>
                <span className={`grow font-sans text-sm transition-opacity ${visible ? "text-ink" : "text-ink-muted line-through opacity-70"}`}>
                  {sign.plural}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        aria-pressed={listening}
        onClick={() => setListening(!listening)}
        className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-full border px-3 py-2 md:min-h-0 font-sans text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        style={{
          borderColor: listening ? "var(--color-cian)" : "color-mix(in oklab, var(--color-line) 60%, transparent)",
          color: listening ? "var(--color-cian)" : undefined,
        }}
      >
        {listening ? (
          <Headphones className="size-4" strokeWidth={1.75} aria-hidden="true" />
        ) : (
          <VolumeX className="size-4" strokeWidth={1.75} aria-hidden="true" />
        )}
        {listening ? "Escuchando el territorio" : "Activar la escucha"}
      </button>
    </>
  );
}
