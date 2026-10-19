import { isValidElement, useEffect, useId, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, CalendarDays, MapPin, X } from "lucide-react";
import BrandLogo from "./BrandLogo.jsx";
import NodeDrawer, { DrawerScroll } from "./NodeDrawer.jsx";

/* ============================================================
   ExternalNodeModal · Ventana de contexto de un aliado
   Se abre al pulsar un ExternalBrandNode: no redirige, primero
   cuenta el vínculo del evento con la narrativa inter-especie.
   · Escritorio: tarjeta centrada. Móvil: hoja inferior (NodeDrawer)
     que se cierra arrastrándola hacia abajo.
   · Colores del tema de la marca (bg/text/accent) solo aquí dentro.
   · Esc, clic en el velo o la X cierran; el foco queda atrapado
     en la ventana mientras está abierta.
   · El CTA abre externalLink en pestaña nueva.
   · Lista las raíces del aliado y permite saltar a ellas (onNavigate).
   NodeDrawer la renderiza en [data-overlay-root] para escapar del lienzo.
   ============================================================ */

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

// "2026-11-14" → "14 de noviembre de 2026"; cualquier otro texto se muestra tal cual
function formatDate(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { label: date };
  const label = new Intl.DateTimeFormat("es", { dateStyle: "long", timeZone: "UTC" }).format(new Date(date));
  return { label, dateTime: date };
}

function renderIcon(icon, className) {
  if (!icon) return null;
  if (isValidElement(icon)) return icon;
  const Icon = icon;
  return <Icon className={className} strokeWidth={1.5} aria-hidden="true" />;
}

// Variables CSS del tema de la marca: el contenido las usa con bg-(--brand-bg), etc.
export const brandVars = (theme = {}) => ({
  "--brand-bg": theme.bgColor,
  "--brand-ink": theme.textColor,
  "--brand-accent": theme.accentColor,
  "--brand-cta-ink": theme.ctaTextColor ?? theme.bgColor,
});

export default function ExternalNodeModal({
  open,
  onClose,
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
  connections = [], // [{ id, title, type, icon }]
  onNavigate,
}) {
  const reduceMotion = useReducedMotion();
  const titleId = useId();
  const summaryId = useId();
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  // onClose puede cambiar en cada render: el efecto lee siempre la última sin reiniciarse
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Esc cierra, Tab no sale de la ventana; foco inicial en la X
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus({ preventScroll: true });
    const onKey = (event) => {
      if (event.key === "Escape") return onCloseRef.current();
      if (event.key !== "Tab" || !dialogRef.current) return;
      const items = [...dialogRef.current.querySelectorAll(FOCUSABLE)];
      const first = items[0];
      const last = items.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const when = date ? formatDate(date) : null;

  return (
    <NodeDrawer
      ref={dialogRef}
      open={open}
      onClose={onClose}
      labelledBy={titleId}
      describedBy={summaryId}
      desktop="center"
      desktopVeil="md:bg-morado-900/50 md:backdrop-blur-sm"
      style={brandVars(theme)}
      className="border border-(--brand-accent)/35 bg-(--brand-bg) text-(--brand-ink)"
    >
      <DrawerScroll className="relative isolate px-7 pb-10 md:p-7">
        {/* Mancha orgánica de acento: identidad de la marca sin tapar el texto */}
        <motion.span
          aria-hidden="true"
          className="shape-blob absolute -top-20 -right-16 -z-10 size-56 bg-(--brand-accent) opacity-25 blur-2xl"
          animate={reduceMotion ? undefined : { rotate: [0, 18, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Cabecera: también es zona de agarre de la hoja en móvil */}
        <div data-sheet-grip className="flex touch-none items-start justify-between gap-4 md:touch-auto">
          <div className="flex min-w-0 items-center gap-4">
            <BrandLogo
              logoUrl={logoUrl}
              brandName={brandName}
              theme={theme}
              alt={`Logo de ${brandName}`}
              className="size-16 text-xl"
            />
            <div className="min-w-0">
              <p className="font-sans text-sm leading-snug">{brandName}</p>
              <p className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-(--brand-accent)/50 px-2.5 py-0.5 font-sans text-xs tracking-[0.18em] uppercase">
                <span className="text-(--brand-accent)">{renderIcon(eventIcon, "size-3.5")}</span>
                {eventType}
              </p>
            </div>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={`Cerrar ${brandName}`}
            className="grid size-11 shrink-0 place-items-center rounded-full transition-colors hover:bg-(--brand-ink)/10 focus-visible:outline-2 focus-visible:outline-(--brand-accent)"
          >
            <X className="size-5" strokeWidth={1.75} aria-hidden="true" />
          </button>
        </div>

        <h2 id={titleId} className="mt-6 text-2xl">
          {title}
        </h2>
        <p id={summaryId} className="mt-3 text-base opacity-85">
          {contextSummary}
        </p>

        {(when || location) && (
          <dl className="mt-5 flex flex-col gap-2 font-sans text-sm">
            {when && (
              <div className="flex items-center gap-2">
                <dt className="text-(--brand-accent)">
                  <CalendarDays className="size-4" strokeWidth={1.75} aria-hidden="true" />
                  <span className="sr-only">Fecha</span>
                </dt>
                <dd>{when.dateTime ? <time dateTime={when.dateTime}>{when.label}</time> : when.label}</dd>
              </div>
            )}
            {location && (
              <div className="flex items-center gap-2">
                <dt className="text-(--brand-accent)">
                  <MapPin className="size-4" strokeWidth={1.75} aria-hidden="true" />
                  <span className="sr-only">Lugar</span>
                </dt>
                <dd>{location}</dd>
              </div>
            )}
          </dl>
        )}

        {externalLink && (
          <motion.a
            href={externalLink}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={reduceMotion ? undefined : { scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="mt-7 flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-(--brand-accent) px-5 py-3 font-sans text-sm text-(--brand-cta-ink) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--brand-accent)"
          >
            Ver evento completo / Registrarse
            <ArrowUpRight className="size-4" strokeWidth={1.75} aria-hidden="true" />
            <span className="sr-only">(se abre en una pestaña nueva)</span>
          </motion.a>
        )}

        {connections.length > 0 && (
          <nav aria-label={`Raíces de ${brandName}`} className="mt-8">
            <p className="font-sans text-xs tracking-[0.24em] uppercase opacity-70">Se entrelaza con</p>
            <ul className="mt-3 flex flex-col gap-2">
              {connections.map((node) => (
                <li key={node.id}>
                  <button
                    type="button"
                    onClick={() => onNavigate?.(node.id)}
                    className="group/raiz flex w-full items-center gap-3 rounded-2xl border border-(--brand-accent)/30 p-3 text-left transition-colors hover:border-(--brand-accent) hover:bg-(--brand-ink)/5 focus-visible:outline-2 focus-visible:outline-(--brand-accent)"
                  >
                    <span className="shape-blob grid size-10 shrink-0 place-items-center bg-(--brand-accent)/15 text-(--brand-accent)">
                      {renderIcon(node.icon, "size-5")}
                    </span>
                    <span className="min-w-0 grow">
                      <span className="block font-sans text-xs opacity-70">{node.type}</span>
                      <span className="block truncate text-sm">{node.title}</span>
                    </span>
                    <ArrowUpRight
                      className="size-4 shrink-0 opacity-60 transition-opacity group-hover/raiz:opacity-100"
                      strokeWidth={1.75}
                      aria-hidden="true"
                    />
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </DrawerScroll>
    </NodeDrawer>
  );
}
