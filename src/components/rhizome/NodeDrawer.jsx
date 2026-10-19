import { createPortal } from "react-dom";
import { AnimatePresence, motion, useDragControls, useReducedMotion } from "motion/react";
import useMediaQuery, { DESKTOP_QUERY } from "../../hooks/useMediaQuery.js";
import { EASE_FLUIDO } from "../../motion/animations.js";

/* ============================================================
   NodeDrawer · Cajón compartido de los paneles del rizoma
   Una sola pieza para el detalle de un nodo, la ficha de un
   aliado y la Mini-Tienda, para que todos se comporten igual.
   · Escritorio (md+): `desktop="side"` cajón lateral que entra
     desde la derecha; `desktop="center"` ventana centrada.
   · Móvil: hoja inferior flotante (85dvh) que sube desde abajo
     (y: 100% → 0). Se cierra arrastrándola hacia abajo con el
     dedo desde el asa o desde cualquier zona marcada con
     `data-sheet-grip` (cabeceras). El resto del contenido hace
     scroll normal, sin pelear con el gesto.
   · Velo: blur suave sobre morado translúcido; en móvil deja ver
     la red rizomática, abstracta, en la franja superior.
   · Se renderiza en [data-overlay-root] (raíz de App) para escapar
     del transform del lienzo arrastrable; si no existe, en <body>.
   El foco y el teclado (Esc, Tab) los gestiona quien lo usa.
   ============================================================ */

// Umbrales de cierre por gesto: distancia (px) o velocidad (px/s)
const CLOSE_OFFSET = 120;
const CLOSE_VELOCITY = 600;

const SHEET_TRANSITION = { type: "spring", stiffness: 380, damping: 38, mass: 0.9 };

const DESKTOP_PANEL = {
  // top-20: deja libre el ThemeToggle fijo (superior derecha)
  side: "md:top-20 md:right-6 md:bottom-6 md:left-auto md:h-auto md:w-[min(30rem,calc(100vw-3rem))] md:rounded-piedra",
  center:
    "md:inset-x-0 md:top-1/2 md:bottom-auto md:mx-auto md:h-auto md:max-h-[85dvh] md:w-[min(28rem,calc(100vw-3rem))] md:-translate-y-1/2 md:rounded-[2rem]",
};

function motionStates({ isDesktop, desktop, reduceMotion }) {
  if (reduceMotion) return { hidden: { opacity: 0 }, shown: { opacity: 1 } };
  if (!isDesktop) return { hidden: { y: "100%" }, shown: { y: 0 } };
  if (desktop === "center") return { hidden: { opacity: 0, y: 32, scale: 0.96 }, shown: { opacity: 1, y: 0, scale: 1 } };
  return { hidden: { x: "100%", opacity: 0.6 }, shown: { x: 0, opacity: 1 } };
}

export default function NodeDrawer({
  open,
  onClose,
  labelledBy,
  describedBy,
  desktop = "side", // "side" | "center"
  desktopVeil = "md:bg-morado-900/15 md:backdrop-blur-none",
  className = "",
  style,
  ref,
  children,
}) {
  const reduceMotion = useReducedMotion();
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const dragControls = useDragControls();
  const { hidden, shown } = motionStates({ isDesktop, desktop, reduceMotion });

  if (typeof document === "undefined") return null;
  const overlayRoot = document.querySelector("[data-overlay-root]") ?? document.body;

  // El gesto solo nace en el asa o en las cabeceras (data-sheet-grip), nunca en botones o enlaces
  const startDrag = (event) => {
    if (isDesktop || reduceMotion) return;
    const target = event.target;
    if (!target.closest?.("[data-sheet-grip]") || target.closest("button, a, input, select, textarea")) return;
    dragControls.start(event);
  };

  const handleDragEnd = (_event, { offset, velocity }) => {
    if (offset.y > CLOSE_OFFSET || velocity.y > CLOSE_VELOCITY) onClose();
  };

  const sheetDrag = isDesktop
    ? {}
    : {
        drag: "y",
        dragControls,
        dragListener: false,
        dragConstraints: { top: 0, bottom: 200 },
        dragElastic: { top: 0, bottom: 0.5 },
        dragSnapToOrigin: true,
        onDragEnd: handleDragEnd,
      };

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="velo"
            aria-hidden="true"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`fixed inset-0 z-40 bg-morado-900/40 backdrop-blur-md ${desktopVeil}`}
          />

          <motion.div
            key="cajon"
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            aria-describedby={describedBy}
            initial={hidden}
            animate={shown}
            exit={hidden}
            transition={isDesktop || reduceMotion ? { duration: 0.5, ease: EASE_FLUIDO } : SHEET_TRANSITION}
            onPointerDown={startDrag}
            {...sheetDrag}
            style={style}
            className={`fixed inset-x-2 bottom-2 z-40 isolate flex h-[85dvh] flex-col overflow-hidden rounded-[2rem] pb-[env(safe-area-inset-bottom)] shadow-fuerte ${DESKTOP_PANEL[desktop]} ${className}`}
          >
            {/* Asa de la hoja: zona de agarre de 44px de alto, solo en móvil */}
            <div data-sheet-grip aria-hidden="true" className="flex h-11 shrink-0 touch-none items-center justify-center md:hidden">
              <span className="h-1.5 w-12 rounded-full bg-current opacity-30" />
            </div>
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    overlayRoot
  );
}

/* Zona con scroll propio dentro del cajón */
export function DrawerScroll({ className = "", ref, children }) {
  return (
    <div ref={ref} className={`min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain ${className}`}>
      {children}
    </div>
  );
}
