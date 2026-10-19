import { isValidElement, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { EASE_FLUIDO } from "../../motion/animations.js";
import BrandLogo from "./BrandLogo.jsx";
import ExternalNodeModal, { brandVars } from "./ExternalNodeModal.jsx";

/* ============================================================
   ExternalBrandNode · Nodo de aliado o marca externa
   Variante de PlateauNode para nodos con isExternal: true.
   · Silueta orgánica que respira (border-radius animado),
     centrada en (xPos, yPos) del lienzo, con halo pulsante del
     color de acento de la marca. También en el smartphone: allí
     se compacta (size-28, ≥ 44px de toque) y conserva su lugar
     en el mapa. whileTap da respuesta táctil inmediata.
   · Clic: abre ExternalNodeModal (no redirige). Con `open` /
     `onOpenChange` el padre controla qué nodo está abierto.
   · onClick puede devolver false para cancelar (tras un arrastre).
   · highlight: "active" | "linked" lo rodea con su color de acento.
   Los colores de theme solo existen dentro del nodo y su ventana.
   ============================================================ */

const SPRING = { type: "spring", stiffness: 320, damping: 22 };
const toCss = (v) => (typeof v === "number" ? `${v}%` : v);

// Dos siluetas orgánicas entre las que respira el nodo
const SHAPES = ["46% 54% 58% 42% / 44% 46% 54% 56%", "56% 44% 42% 58% / 54% 58% 42% 46%"];

function renderIcon(icon, className) {
  if (!icon) return null;
  if (isValidElement(icon)) return icon;
  const Icon = icon;
  return <Icon className={className} strokeWidth={1.75} aria-hidden="true" />;
}

const ringFor = (highlight) =>
  highlight === "active"
    ? "0 0 0 3px var(--brand-accent), var(--shadow-fuerte)"
    : highlight === "linked"
      ? "0 0 0 2px color-mix(in oklab, var(--brand-accent) 75%, transparent), var(--shadow-suave)"
      : "0 0 0 1px color-mix(in oklab, var(--brand-accent) 45%, transparent), var(--shadow-suave)";

function EventChip({ icon, eventType }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-(--brand-accent)/20 px-2 py-0.5 font-sans text-[0.65rem] tracking-[0.16em] uppercase">
      <span className="text-(--brand-accent)">{renderIcon(icon, "size-3")}</span>
      {eventType}
    </span>
  );
}

export default function ExternalBrandNode({
  brandName,
  title,
  logoUrl,
  eventType,
  eventIcon,
  theme,
  contextSummary,
  date,
  location,
  externalLink,
  xPos = 0,
  yPos = 0,
  onClick,
  open: openProp,
  onOpenChange,
  connections = [],
  onNavigate,
  highlight = null,
  onHoverChange,
  index = 0,
}) {
  const [openState, setOpenState] = useState(false);
  const open = openProp ?? openState;
  const setOpen = (value) => {
    setOpenState(value);
    onOpenChange?.(value);
  };
  const reduceMotion = useReducedMotion();
  const triggerRef = useRef(null);

  const handleOpen = (event) => {
    if (onClick?.(event) === false) return;
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    triggerRef.current?.focus({ preventScroll: true });
  };

  const pulse = reduceMotion ? undefined : { scale: [1, 1.22, 1], opacity: [0.45, 0, 0.45] };
  const pulseTransition = { duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: index * 0.4 };

  return (
    <>
      <motion.button
        ref={triggerRef}
        type="button"
        onClick={handleOpen}
        onPointerEnter={() => onHoverChange?.(true)}
        onPointerLeave={() => onHoverChange?.(false)}
        onFocus={() => onHoverChange?.(true)}
        onBlur={() => onHoverChange?.(false)}
        aria-haspopup="dialog"
        aria-expanded={open}
        initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={reduceMotion ? undefined : { scale: 1.08, transition: SPRING }}
        whileTap={{ scale: 0.94 }}
        transition={{ duration: 0.7, ease: EASE_FLUIDO, delay: 0.3 + index * 0.1 }}
        style={{ ...brandVars(theme), left: toCss(xPos), top: toCss(yPos), WebkitTapHighlightColor: "transparent" }}
        className="group absolute size-28 -translate-x-1/2 -translate-y-1/2 select-none focus-visible:outline-none md:size-44"
      >
        {/* Halo pulsante del color de la marca */}
        <motion.span
          aria-hidden="true"
          className="absolute inset-0 rounded-full bg-(--brand-accent) blur-md"
          animate={pulse}
          transition={pulseTransition}
        />

        {/* Cuerpo orgánico: respira entre dos siluetas */}
        <motion.span
          className="relative flex size-full flex-col items-center justify-center gap-1 bg-(--brand-bg) px-3 text-center text-(--brand-ink) group-focus-visible:outline-2 group-focus-visible:outline-offset-4 group-focus-visible:outline-accent md:gap-1.5 md:px-4"
          style={{ borderRadius: SHAPES[0], boxShadow: ringFor(highlight), transition: "box-shadow 0.3s" }}
          animate={reduceMotion ? undefined : { borderRadius: SHAPES }}
          transition={{ duration: 6, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
        >
          <BrandLogo logoUrl={logoUrl} brandName={brandName} theme={theme} className="size-10 text-sm md:size-14 md:text-lg" />
          <span className="line-clamp-2 font-sans text-[0.6rem] leading-tight md:text-xs">{brandName}</span>
          {/* En móvil el tipo de evento se lee en la hoja, para no saturar la silueta */}
          <span className="hidden md:block">
            <EventChip icon={eventIcon} eventType={eventType} />
          </span>
          <span className="sr-only">: {title}</span>
        </motion.span>
      </motion.button>

      <ExternalNodeModal
        open={open}
        onClose={handleClose}
        brandName={brandName}
        title={title}
        logoUrl={logoUrl}
        eventType={eventType}
        eventIcon={eventIcon}
        theme={theme}
        contextSummary={contextSummary}
        date={date}
        location={location}
        externalLink={externalLink}
        connections={connections}
        onNavigate={onNavigate}
      />
    </>
  );
}
