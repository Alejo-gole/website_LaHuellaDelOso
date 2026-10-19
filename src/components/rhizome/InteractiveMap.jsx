import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from "motion/react";
import { RELATIONS, SIGNS } from "../../data/ontology.js";
import { EASE_FLUIDO } from "../../motion/animations.js";

/* ============================================================
   InteractiveMap · Lienzo arrastrable del Territorio Rizomático
   Superficie más grande que la pantalla (drag de Motion) que se
   conserva en todos los tamaños: en el smartphone el territorio
   sigue siendo un mapa espacial, no una lista.
   · Escala responsiva: el lienzo mide en vw/vh. En escritorio
     170vw × 180vh; en móvil (`compact`) es proporcionalmente más
     pequeño respecto al tamaño de los nodos, así que las mesetas
     quedan más próximas entre sí, al alcance del pulgar, sin
     solaparse (las tarjetas también se compactan).
   · dragConstraints numéricos, recalculados con window.innerWidth
     / innerHeight y el tamaño real del lienzo (ResizeObserver): el
     borde del lienzo nunca se aleja más que un margen, así que no
     se pierden los nodos en los bordes del teléfono. Al girar el
     teléfono la posición se reencaja dentro de los nuevos límites.
   · touch-action: none en el lienzo: el scroll y el rebote nativos
     del navegador no interfieren con el arrastre.
   · focusId: al cambiar (p. ej. al saltar por una raíz), el lienzo
     se desliza para centrar ese nodo.
   Raíces SVG: una por arista, pintada según su signo
   (data/ontology.js → SIGNS): índice en cian y punteado corto,
   ícono en violeta y guiones, símbolo en carmesí y trazo continuo;
   las raíces sin tipo, en --color-oso-teal. Las del nodo activo se
   iluminan y muestran su verbo («deja rastro en»…); el resto se
   atenúa. hiddenSigns apaga las capas que el usuario desactivó.
   Las raíces que llegan a un aliado (isExternal) toman su
   theme.accentColor; las de un observador humano son más tenues.
   Los nodos llegan como children. `dragged` es un ref que el padre
   consulta para que un arrastre no abra un nodo.
   ============================================================ */

// xPos/yPos en % del lienzo: acepta 20 o "20%"
const toPercent = (v) => (typeof v === "number" ? v : parseFloat(v));

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

// Tamaño del lienzo: mismo trazado de nodos en %, distinta escala física
const CANVAS_SIZE = "h-[max(185svh,88rem)] w-[max(330vw,76rem)] md:h-[180vh] md:w-[170vw]";

// Margen que el lienzo puede despegarse del borde de la pantalla, en fracción del viewport.
// En móvil es mayor: las tarjetas del borde quedan enteras y libres del título y la leyenda.
// En escritorio es 0: el lienzo nunca deja ver su borde (comportamiento original).
const EDGE = {
  compact: { x: 0.12, top: 0.14, bottom: 0.12 },
  wide: { x: 0, top: 0, bottom: 0 },
};

function computeConstraints(canvas, compact) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const edge = compact ? EDGE.compact : EDGE.wide;
  const w = canvas.offsetWidth;
  const h = canvas.offsetHeight;
  return {
    left: Math.min(0, vw - w) - vw * edge.x,
    right: vw * edge.x,
    top: Math.min(0, vh - h) - vh * edge.bottom,
    bottom: vh * edge.top,
    vw,
    vh,
    w,
    h,
  };
}

// Color de la raíz: el acento del aliado si uno de los extremos es externo; si no, el de su signo
function rootColors(from, to, meta) {
  const brand = from.isExternal ? from : to.isExternal ? to : null;
  const accent = brand?.theme?.accentColor;
  if (accent) return { latent: accent, lit: accent, dash: "1 4" };
  const sign = SIGNS[meta?.sign];
  if (sign) return { latent: sign.color, lit: sign.color, dash: sign.dash };
  return { latent: undefined, lit: "var(--color-oso-teal)", dash: "2 6" };
}

const isMargin = (node) => node.kind === "observador";

// Geometría de la raíz: curva cuadrática y su punto medio (para el verbo)
function rootPath([a, b], i, nodesById) {
  const from = nodesById[a];
  const to = nodesById[b];
  const x1 = toPercent(from.xPos);
  const y1 = toPercent(from.yPos);
  const x2 = toPercent(to.xPos);
  const y2 = toPercent(to.yPos);
  const midX = (x1 + x2) / 2 + (i % 2 ? 6 : -6);
  const midY = (y1 + y2) / 2 + (i % 2 ? -5 : 5);
  return {
    from,
    to,
    d: `M${x1} ${y1} Q${midX} ${midY} ${x2} ${y2}`,
    label: { x: (x1 + 2 * midX + x2) / 4, y: (y1 + 2 * midY + y2) / 4 },
  };
}

const ROOT_STYLE = {
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round",
  vectorEffect: "non-scaling-stroke",
};

const PAN_SPRING = { type: "spring", stiffness: 140, damping: 26 };

/* Límites de arrastre vivos y posición del lienzo (x, y en px) */
function useCanvasBounds(canvasRef, { compact, focus }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [bounds, setBounds] = useState(null);
  const placed = useRef(false);

  const measure = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const next = computeConstraints(canvas, compact);

    if (!placed.current) {
      // Primera medida: el punto focal del territorio queda en el centro de la pantalla
      placed.current = true;
      x.set(clamp(next.vw / 2 - (focus[0] / 100) * next.w, next.left, next.right));
      y.set(clamp(next.vh / 2 - (focus[1] / 100) * next.h, next.top, next.bottom));
    } else {
      // Giro o cambio de tamaño: se reencaja dentro de los nuevos límites
      x.set(clamp(x.get(), next.left, next.right));
      y.set(clamp(y.get(), next.top, next.bottom));
    }
    setBounds(next);
  }, [canvasRef, compact, focus, x, y]);

  useLayoutEffect(() => {
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(canvasRef.current);
    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
    };
  }, [canvasRef, measure]);

  return { x, y, bounds };
}

export default function InteractiveMap({
  dragged,
  nodesById,
  edges,
  activeId = null,
  focusId = null,
  focus = [50, 50], // punto del lienzo (en %) que se centra al entrar
  compact = false, // true en móvil
  hiddenSigns = new Set(),
  children,
}) {
  const reduceMotion = useReducedMotion();
  const canvasRef = useRef(null);
  const [initialFocus] = useState(focus); // el punto focal solo cuenta en la primera medida
  const { x, y, bounds } = useCanvasBounds(canvasRef, { compact, focus: initialFocus });
  const boundsRef = useRef(bounds);
  boundsRef.current = bounds;

  // Centrar el nodo enfocado (salto por una raíz o selección). Lee los límites
  // por ref: girar el teléfono reencaja el lienzo, pero no vuelve a centrar.
  useEffect(() => {
    const node = focusId ? nodesById[focusId] : null;
    const b = boundsRef.current;
    if (!node || !b) return;
    const targetX = clamp(b.vw / 2 - (toPercent(node.xPos) / 100) * b.w, b.left, b.right);
    const targetY = clamp(b.vh / 2 - (toPercent(node.yPos) / 100) * b.h, b.top, b.bottom);
    const transition = reduceMotion ? { duration: 0 } : PAN_SPRING;
    const controls = [animate(x, targetX, transition), animate(y, targetY, transition)];
    return () => controls.forEach((c) => c.stop());
  }, [focusId, nodesById, reduceMotion, x, y]);

  return (
    <motion.div
      ref={canvasRef}
      drag
      dragConstraints={bounds ? { left: bounds.left, right: bounds.right, top: bounds.top, bottom: bounds.bottom } : false}
      dragElastic={compact ? 0.14 : 0.08}
      dragTransition={{ power: compact ? 0.35 : 0.25, timeConstant: compact ? 320 : 260 }}
      onPointerDown={() => (dragged.current = false)}
      onDragStart={() => (dragged.current = true)}
      initial={{ opacity: 0, scale: reduceMotion ? 1 : 1.03 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.9, ease: EASE_FLUIDO }}
      style={{ x, y, touchAction: "none" }}
      className={`bg-topography absolute top-0 left-0 ${CANVAS_SIZE} cursor-grab touch-none overscroll-none select-none active:cursor-grabbing`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 size-full text-accent"
      >
        {edges.map(([a, b, meta], i) => {
          const { from, to, d } = rootPath([a, b], i, nodesById);
          const hidden = hiddenSigns.has(meta?.sign);
          const lit = !hidden && activeId !== null && (a === activeId || b === activeId);
          const colors = rootColors(from, to, meta);
          const margin = isMargin(from) || isMargin(to);
          const rest = hidden ? 0.04 : margin ? 0.25 : 0.45;

          return (
            <g key={`${a}-${b}`} style={colors.latent ? { color: colors.latent } : undefined}>
              {/* Raíz latente: punteada, se atenúa cuando otra raíz brilla */}
              <motion.path
                d={d}
                {...ROOT_STYLE}
                strokeWidth={margin ? 0.9 : 1.25}
                strokeDasharray={colors.dash}
                initial={{ pathLength: reduceMotion ? 1 : 0, opacity: rest }}
                animate={{ pathLength: 1, opacity: activeId === null || hidden ? rest : lit ? 0 : 0.18 }}
                transition={{
                  pathLength: { duration: 1.6, ease: EASE_FLUIDO, delay: 0.4 + i * 0.12 },
                  opacity: { duration: 0.4, ease: EASE_FLUIDO },
                }}
              />

              {/* Raíz viva: halo + trazo (teal o acento del aliado) que recorre la conexión */}
              <motion.g
                style={{ color: colors.lit }}
                initial={false}
                animate={{ opacity: lit ? 1 : 0 }}
                transition={{ duration: 0.35, ease: EASE_FLUIDO }}
              >
                <path d={d} {...ROOT_STYLE} strokeWidth={compact ? 7 : 9} opacity={0.18} />
                <motion.path
                  d={d}
                  {...ROOT_STYLE}
                  strokeWidth={2.5}
                  initial={false}
                  animate={{ pathLength: lit || reduceMotion ? 1 : 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.7, ease: EASE_FLUIDO }}
                />
              </motion.g>
            </g>
          );
        })}
      </svg>

      {/* Verbos de las aristas vivas: aparecen solo cuando el usuario activa un nodo (bajo las tarjetas) */}
      <AnimatePresence>
        {activeId !== null &&
          edges.map(([a, b, meta], i) => {
            if (meta?.type === "raiz" || hiddenSigns.has(meta?.sign) || (a !== activeId && b !== activeId)) return null;
            const { label } = rootPath([a, b], i, nodesById);
            const relation = RELATIONS[meta?.type];
            const sign = SIGNS[meta?.sign];
            if (!relation) return null;
            return (
              <motion.span
                key={`${a}-${b}-verbo`}
                aria-hidden="true"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: EASE_FLUIDO, delay: reduceMotion ? 0 : 0.25 }}
                style={{ left: `${label.x}%`, top: `${label.y}%`, color: sign?.color }}
                className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-current bg-bg/90 px-2 py-0.5 font-sans text-[0.65rem] whitespace-nowrap md:px-2.5 md:text-[0.7rem]"
              >
                {a === activeId ? relation.label : relation.back}
              </motion.span>
            );
          })}
      </AnimatePresence>

      {children}
    </motion.div>
  );
}
