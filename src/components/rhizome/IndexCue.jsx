import { motion, useReducedMotion } from "motion/react";
import { EASE_FLUIDO } from "../../motion/animations.js";

/* ============================================================
   IndexCue · Índice de entrada de un nodo
   La puerta de un nodo no es una etiqueta sino una pista que se
   interpreta: un sonido o un rastro visual.
   · entry.kind "visual": la foto de entry.src o, sin foto, un
     rastro dibujado en SVG (entry.glyph) que se traza al activarse.
   · entry.kind "sonoro": una onda que vibra mientras suena.
   · active: el nodo está bajo el cursor, enfocado o abierto.
   El color llega por `color` (el del signo del nodo).
   ============================================================ */

const STROKE = { fill: "none", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round" };

// Rastros dibujados: cada uno es una lista de trazos (d) en un viewBox de 120×80
const GLYPHS = {
  // Cuatro surcos de garra sobre vetas de corteza
  garras: {
    texture: ["M8 14c30 4 70-4 104 2", "M6 40c34 3 74-5 108 1", "M10 66c28 4 72-3 102 3"],
    marks: ["M34 10c6 20 8 40 4 62", "M48 8c6 22 7 42 3 64", "M62 9c5 21 6 41 2 63", "M76 12c4 19 5 38 1 58"],
  },
  // Huella de oso: almohadilla y cinco dedos
  huella: {
    texture: [],
    marks: [
      "M40 56c0-12 9-20 20-20s20 8 20 20c0 9-8 14-20 14s-20-5-20-14Z",
      "M34 34a5 6 0 1 0 0.1 0",
      "M45 25a5 6 0 1 0 0.1 0",
      "M60 22a5 6 0 1 0 0.1 0",
      "M75 25a5 6 0 1 0 0.1 0",
      "M86 34a5 6 0 1 0 0.1 0",
    ],
  },
  // Gota que cae y abre ondas
  gota: {
    texture: ["M30 64c10-6 50-6 60 0", "M18 70c16-9 68-9 84 0"],
    marks: ["M60 10c8 14 14 22 14 30a14 14 0 0 1-28 0c0-8 6-16 14-30Z"],
  },
  // Roseta de frailejón vista desde arriba
  frailejon: {
    texture: [],
    marks: [
      "M60 40c-4-14-2-26 0-32 2 6 4 18 0 32Z",
      "M60 40c14-4 26-2 32 0-6 2-18 4-32 0Z",
      "M60 40c4 14 2 26 0 32-2-6-4-18 0-32Z",
      "M60 40c-14 4-26 2-32 0 6-2 18-4 32 0Z",
      "M60 40c-10-10-14-20-15-25 6 3 13 12 15 25Z",
      "M60 40c10-10 20-14 25-15-3 6-12 13-25 15Z",
      "M60 40c10 10 14 20 15 25-6-3-13-12-15-25Z",
      "M60 40c-10 10-20 14-25 15 3-6 12-13 25-15Z",
    ],
  },
  onda: {
    texture: [],
    marks: ["M8 40c10-20 14-20 20 0s10 20 20 0 14-20 20 0 10 20 20 0 14-20 24 0"],
  },
};

function VisualGlyph({ glyph, active, reduceMotion }) {
  const { texture, marks } = GLYPHS[glyph] ?? GLYPHS.huella;
  return (
    <svg viewBox="0 0 120 80" aria-hidden="true" className="size-full">
      {texture.map((d) => (
        <path key={d} d={d} {...STROKE} strokeWidth={1} opacity={0.3} />
      ))}
      {marks.map((d, i) => (
        <motion.path
          key={d}
          d={d}
          {...STROKE}
          strokeWidth={2.4}
          initial={false}
          animate={{ pathLength: active || reduceMotion ? 1 : 0.6, opacity: active ? 1 : 0.7 }}
          transition={{ duration: 0.8, ease: EASE_FLUIDO, delay: active ? i * 0.08 : 0 }}
        />
      ))}
    </svg>
  );
}

const BARS = [0.35, 0.7, 0.5, 1, 0.6, 0.85, 0.4, 0.75, 0.3, 0.55, 0.9, 0.45];

function SoundWave({ active, reduceMotion }) {
  return (
    <span aria-hidden="true" className="flex size-full items-center justify-center gap-[3px]">
      {BARS.map((h, i) => (
        <motion.span
          key={i}
          className="w-[3px] rounded-full bg-current"
          initial={false}
          animate={
            active && !reduceMotion
              ? { height: [`${h * 30}%`, `${h * 90}%`, `${h * 45}%`], opacity: 1 }
              : { height: `${h * 40}%`, opacity: 0.6 }
          }
          transition={
            active && !reduceMotion
              ? { duration: 0.5 + (i % 4) * 0.12, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }
              : { duration: 0.4, ease: EASE_FLUIDO }
          }
        />
      ))}
    </span>
  );
}

export default function IndexCue({ entry, active = false, color, className = "" }) {
  const reduceMotion = useReducedMotion();
  if (!entry) return null;

  return (
    <span style={{ color }} className={`relative block overflow-hidden rounded-2xl ${className}`}>
      {/* Fondo: el color del signo, muy diluido */}
      <span aria-hidden="true" className="absolute inset-0 bg-current opacity-10" />
      <span className="relative block size-full p-3">
        {entry.kind === "visual" ? (
          entry.src ? (
            <img src={entry.src} alt="" className="size-full rounded-xl object-cover" loading="lazy" />
          ) : (
            <VisualGlyph glyph={entry.glyph} active={active} reduceMotion={reduceMotion} />
          )
        ) : (
          <SoundWave active={active} reduceMotion={reduceMotion} />
        )}
      </span>
    </span>
  );
}
