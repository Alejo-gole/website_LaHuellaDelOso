import { isValidElement, useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, ChevronDown, Volume2, X } from "lucide-react";
import { LAYERS, SIGNS } from "../../data/ontology.js";
import { EASE_FLUIDO } from "../../motion/animations.js";
import IndexCue from "./IndexCue.jsx";
import NodeDrawer, { DrawerScroll } from "./NodeDrawer.jsx";

/* ============================================================
   PlateauNode · Meseta Rizomática
   Nodo topográfico ("huella") del Territorio Rizomático.
   · Siempre en el mapa: position absolute en (xPos, yPos) dentro
     del lienzo, también en el smartphone.
   · Móvil: tarjeta compacta (w-36) que conserva índice, signo y
     título; el resto vive en el panel. Área de toque ≥ 44×44px.
     Al presionar responde al instante (whileTap scale 0.94).
   · Escritorio (md+): tarjeta completa; hover la hace flotar.
   · Clic / toque: abre su panel en NodeDrawer, cajón lateral en
     escritorio y hoja inferior arrastrable en móvil, renderizado
     en un portal para escapar del transform del lienzo.
   · El panel lista los nodos conectados (`connections`) y permite
     saltar a ellos con onNavigate. Con `open`/`onOpenChange` el
     padre controla qué nodo está abierto.
   · highlight: "active" (nodo activo) | "linked" (conectado al
     activo) lo rodea con --color-oso-teal (o highlightColor).
   · Ontología (data/ontology.js), todo opcional:
     entry   Índice de entrada (IndexCue): la tarjeta se abre con la
             pista sonora o visual, no con el título. onCue(entry)
             al señalar o abrir el nodo; onCue(entry, { force: true })
             desde el botón «Volver a escuchar».
     layers  { sensible, relato, memoria }: el panel las revela una a
             una cuando el usuario decide descender.
     sign / kindLabel / modes / agents  Cómo, qué y quiénes significan.
     margin  Observador humano: tarjeta pequeña y tenue, en el borde.
     dimmed  Su capa de signo está apagada en la leyenda.
   ============================================================ */
const SPRING = { type: "spring", stiffness: 320, damping: 26 };
const TAP = { scale: 0.94 };

// Coordenadas = centro del nodo. Números → porcentaje del lienzo; strings ("320px", "40%") se respetan.
const toCss = (v) => (typeof v === "number" ? `${v}%` : v);

// Acepta un componente de lucide (Mic) o un elemento ya creado (<Mic />).
function renderIcon(icon, className) {
  if (!icon) return null;
  if (isValidElement(icon)) return icon;
  const Icon = icon;
  return <Icon className={className} strokeWidth={1.5} aria-hidden="true" />;
}

/* Curvas de nivel concéntricas e irregulares: la "huella" del nodo */
function ContourPrint({ className = "" }) {
  return (
    <svg viewBox="0 0 200 200" aria-hidden="true" className={`pointer-events-none ${className}`} fill="none">
      {[0, 1, 2, 3, 4].map((i) => {
        const s = 1 - i * 0.17;
        return (
          <path
            key={i}
            transform={`translate(100 100) scale(${s}) rotate(${i * 11}) translate(-100 -100)`}
            d="M100 14c38 0 78 22 84 62 6 38-14 78-52 92-36 14-86 6-104-30C10 104 14 58 42 34 58 20 78 14 100 14Z"
            stroke="currentColor"
            strokeWidth={1.2 / s}
            opacity={0.18 + i * 0.12}
          />
        );
      })}
    </svg>
  );
}

// Halo del nodo activo y de sus conexiones (sobrescribe la sombra de card-glass).
// Teal por defecto; si el activo es un aliado, su color de acento.
const highlightStyle = (highlight, color = "var(--color-oso-teal)") =>
  ({
    active: {
      borderColor: color,
      boxShadow: `0 0 0 2px ${color}, var(--shadow-fuerte)`,
    },
    linked: {
      borderColor: color,
      boxShadow: `0 0 0 1px color-mix(in oklab, ${color} 70%, transparent), var(--shadow-suave)`,
    },
  })[highlight];

export default function PlateauNode({
  title,
  category,
  concept,
  description,
  icon,
  link,
  xPos = 0,
  yPos = 0,
  onClick,
  open: openProp,
  onOpenChange,
  connections = [], // [{ id, title, type, icon }]
  onNavigate,
  highlight = null,
  highlightColor, // CSS; por defecto --color-oso-teal
  onHoverChange,
  index = 0, // escalonado de entrada
  sign, // "indice" | "icono" | "simbolo"
  kindLabel,
  modes = [], // [{ id, label, icon }]
  entry,
  layers,
  agents = [],
  margin = false,
  dimmed = false,
  onCue,
}) {
  const [openState, setOpenState] = useState(false);
  const open = openProp ?? openState;
  const setOpen = (value) => {
    setOpenState(value);
    onOpenChange?.(value);
  };
  const reduceMotion = useReducedMotion();
  const titleId = useId();
  const triggerRef = useRef(null);
  const closeRef = useRef(null);
  const [hovering, setHovering] = useState(false);
  const signInfo = SIGNS[sign];
  const signColor = signInfo?.color ?? "var(--color-accent)";

  const handleHover = (value) => {
    setHovering(value);
    onHoverChange?.(value);
    if (value) onCue?.(entry);
  };

  const handleOpen = (event) => {
    // El lienzo puede cancelar la apertura (p. ej. si fue un arrastre)
    const allowed = onClick?.(event);
    if (allowed === false) return;
    onCue?.(entry);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    triggerRef.current?.focus({ preventScroll: true });
  };

  // Escape cierra; foco al botón de cierre al abrir
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus({ preventScroll: true });
    const onKey = (e) => e.key === "Escape" && handleClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <motion.button
        ref={triggerRef}
        type="button"
        onClick={handleOpen}
        onPointerEnter={() => handleHover(true)}
        onPointerLeave={() => handleHover(false)}
        onFocus={() => handleHover(true)}
        onBlur={() => handleHover(false)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={entry ? `${entry.label}. ${title}` : undefined}
        initial={{ opacity: 0, y: reduceMotion ? 0 : 16, scale: reduceMotion ? 1 : 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        // whileHover solo responde a ratón/lápiz; whileTap da la respuesta táctil inmediata
        whileHover={reduceMotion ? undefined : { y: -8, transition: SPRING }}
        whileTap={TAP}
        transition={{ duration: 0.7, ease: EASE_FLUIDO, delay: 0.15 + index * 0.12 }}
        style={{
          left: toCss(xPos),
          top: toCss(yPos),
          // card-glass anima `transform` por CSS; Motion se encarga de él aquí
          transition: "background-color 0.3s, border-color 0.3s, box-shadow 0.3s, filter 0.4s",
          // Atenuado por filtro: `opacity` es de Motion y arrastra el retraso de entrada
          filter: dimmed ? "opacity(0.25)" : margin && !highlight && !hovering ? "opacity(0.7)" : undefined,
          WebkitTapHighlightColor: "transparent",
          ...highlightStyle(highlight, highlightColor),
        }}
        className={`card-glass group absolute isolate min-h-11 min-w-11 -translate-x-1/2 -translate-y-1/2 touch-manipulation overflow-hidden text-left select-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent ${
          margin ? "w-36 border-dashed p-2.5 md:w-52 md:p-4" : "w-36 p-3 md:w-72 md:p-6"
        }`}
      >
        {margin ? (
          <MarginFace icon={icon} kindLabel={kindLabel} title={title} />
        ) : (
          <PlateauFace
            entry={entry}
            icon={icon}
            category={category}
            concept={concept}
            title={title}
            description={description}
            signInfo={signInfo}
            signColor={signColor}
            active={hovering || open}
          />
        )}
      </motion.button>

      <NodeDrawer
        open={open}
        onClose={handleClose}
        labelledBy={titleId}
        desktop="side"
        className="border border-line/40 bg-surface/95 text-ink backdrop-blur-xl"
        style={{ transition: "background-color 0.3s, border-color 0.3s" }}
      >
        <DrawerScroll className="relative isolate px-6 pb-10 md:p-7">
          <ContourPrint className="absolute -top-24 -right-24 -z-10 size-80 text-accent" />

          {/* Cabecera: también es zona de agarre de la hoja en móvil */}
          <div data-sheet-grip className="flex touch-none items-start justify-between gap-4 md:touch-auto">
            <span className="shape-blob grid size-14 shrink-0 place-items-center bg-[color-mix(in_oklab,var(--color-accent)_14%,transparent)] text-accent md:size-16">
              {renderIcon(icon, "size-6 md:size-7")}
            </span>
            <motion.button
              ref={closeRef}
              type="button"
              onClick={handleClose}
              aria-label="Cerrar meseta"
              whileTap={TAP}
              className="grid size-11 place-items-center rounded-full text-ink-soft transition-colors hover:bg-surface-hover hover:text-ink focus-visible:outline-2 focus-visible:outline-accent"
            >
              <X className="size-5" strokeWidth={1.75} aria-hidden="true" />
            </motion.button>
          </div>

          {entry && (
            <div className="mt-6">
              <IndexCue entry={entry} active color={signColor} className="h-24 w-full md:h-28" />
              <div className="mt-3 flex items-start justify-between gap-3">
                <p className="font-text text-base text-ink italic">«{entry.label}»</p>
                {entry.kind === "sonoro" && (
                  <motion.button
                    type="button"
                    onClick={() => onCue?.(entry, { force: true })}
                    aria-label="Volver a escuchar"
                    whileTap={TAP}
                    className="grid size-11 shrink-0 place-items-center rounded-full border border-current transition-colors hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-accent"
                    style={{ color: signColor }}
                  >
                    <Volume2 className="size-4" strokeWidth={1.75} aria-hidden="true" />
                  </motion.button>
                )}
              </div>
            </div>
          )}

          <p className="mt-6 flex flex-wrap items-center gap-x-2 font-sans text-xs tracking-[0.24em] text-accent uppercase">
            {category}
            {kindLabel && <span className="text-ink-muted">· {kindLabel}</span>}
          </p>
          <h2 id={titleId} className="mt-2 text-2xl text-ink">
            {title}
          </h2>
          {concept && <p className="mt-1 font-sans text-sm text-ink-muted">Concepto · {concept}</p>}

          {(signInfo || modes.length > 0) && (
            <ul aria-label="Cómo significa" className="mt-4 flex flex-wrap gap-2">
              {signInfo && (
                <li
                  title={signInfo.hint}
                  className="inline-flex items-center gap-1.5 rounded-full border border-current px-2.5 py-0.5 font-sans text-xs"
                  style={{ color: signColor }}
                >
                  <SignDot color={signColor} />
                  {signInfo.label}
                </li>
              )}
              {modes.map((mode) => (
                <li
                  key={mode.id}
                  className="inline-flex items-center gap-1.5 rounded-full bg-surface-hover px-2.5 py-0.5 font-sans text-xs text-ink-soft"
                >
                  {renderIcon(mode.icon, "size-3.5")}
                  {mode.label}
                </li>
              ))}
            </ul>
          )}

          {layers ? <LayerDescent layers={layers} /> : <p className="mt-4 text-base text-ink-soft">{description}</p>}

          {agents.length > 0 && (
            <div className="mt-6">
              <p className="font-sans text-xs tracking-[0.24em] text-ink-muted uppercase">Quiénes significan aquí</p>
              <p className="mt-2 text-sm text-ink-soft">{agents.join(" · ")}</p>
            </div>
          )}

          {link && (
            <motion.a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              whileTap={TAP}
              className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-accent px-5 py-2 font-sans text-sm text-crema-base transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Ver pieza
              <ArrowUpRight className="size-4" strokeWidth={1.75} aria-hidden="true" />
            </motion.a>
          )}

          {connections.length > 0 && (
            <nav aria-label={`Conexiones de ${title}`} className="mt-8">
              <p className="font-sans text-xs tracking-[0.24em] text-ink-muted uppercase">Raíces · relaciones</p>
              <ul className="mt-3 flex flex-col gap-2">
                {connections.map((node) => (
                  <li key={node.id}>
                    <ConnectionButton node={node} onNavigate={onNavigate} />
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </DrawerScroll>
      </NodeDrawer>
    </>
  );
}

/* Cara de una meseta en el mapa: compacta en móvil, completa en md+ */
function PlateauFace({ entry, icon, category, concept, title, description, signInfo, signColor, active }) {
  return (
    <>
      <ContourPrint className="absolute -top-10 -right-10 -z-10 size-32 text-accent transition-transform duration-700 ease-fluido group-hover:scale-110 group-hover:rotate-6 md:-top-16 md:-right-16 md:size-56" />

      {entry ? (
        <>
          <IndexCue entry={entry} active={active} color={signColor} className="mb-2 h-12 w-full md:mb-4 md:h-24" />
          <span className="line-clamp-2 font-text text-sm leading-snug text-ink italic md:text-base">«{entry.label}»</span>
        </>
      ) : (
        <span className="shape-blob mb-2 grid size-10 place-items-center bg-[color-mix(in_oklab,var(--color-accent)_14%,transparent)] text-accent ring-1 ring-[color-mix(in_oklab,var(--color-accent)_30%,transparent)] md:mb-5 md:size-14">
          {renderIcon(icon, "size-5 md:size-6")}
        </span>
      )}

      <span
        className={`flex items-center gap-1.5 font-sans text-[0.6rem] tracking-[0.18em] text-accent uppercase md:gap-2 md:text-xs md:tracking-[0.24em] ${
          entry ? "mt-2 md:mt-4" : ""
        }`}
      >
        {signInfo && <SignDot color={signColor} />}
        <span className="truncate">{category}</span>
      </span>
      {concept && <span className="mt-1 hidden font-sans text-xs text-ink-muted md:block">{concept}</span>}
      <h3 className={`mt-1 line-clamp-2 text-sm leading-tight text-ink md:line-clamp-none ${entry ? "md:text-lg" : "md:text-xl"}`}>
        {title}
      </h3>
      {!entry && <p className="mt-3 hidden text-sm text-ink-soft md:line-clamp-2">{description}</p>}

      <span className="mt-5 hidden items-center gap-2 font-sans text-xs text-ink-muted transition-colors group-hover:text-accent md:inline-flex">
        <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
        {entry ? (entry.kind === "sonoro" ? "Seguir el sonido" : "Seguir el rastro") : "Explorar meseta"}
      </span>
    </>
  );
}

function ConnectionButton({ node, onNavigate }) {
  return (
    <motion.button
      type="button"
      onClick={() => onNavigate?.(node.id)}
      whileTap={{ scale: 0.97 }}
      className="group/raiz flex min-h-11 w-full items-center gap-3 rounded-2xl border border-[color-mix(in_oklab,var(--color-oso-teal)_35%,transparent)] p-3 text-left transition-colors hover:border-[var(--color-oso-teal)] hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-accent"
    >
      <span className="shape-blob grid size-10 shrink-0 place-items-center bg-[color-mix(in_oklab,var(--color-oso-teal)_14%,transparent)] text-[var(--color-oso-teal)]">
        {renderIcon(node.icon, "size-5")}
      </span>
      <span className="min-w-0 grow">
        {node.verb && (
          <span className="block font-sans text-xs" style={{ color: SIGNS[node.sign]?.color }}>
            {node.verb}
          </span>
        )}
        <span className="block font-sans text-xs text-ink-muted">{node.type}</span>
        <span className="block truncate text-sm text-ink">{node.title}</span>
      </span>
      <ArrowUpRight
        className="size-4 shrink-0 text-ink-muted transition-colors group-hover/raiz:text-[var(--color-oso-teal)]"
        strokeWidth={1.75}
        aria-hidden="true"
      />
    </motion.button>
  );
}

function SignDot({ color }) {
  return <span aria-hidden="true" className="size-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />;
}

/* Cara de un observador humano: pequeña, sin huella topográfica */
function MarginFace({ icon, kindLabel, title }) {
  return (
    <span className="flex items-center gap-2.5 md:gap-3">
      <span className="grid size-8 shrink-0 place-items-center rounded-full border border-dashed border-current text-ink-muted md:size-9">
        {renderIcon(icon, "size-4")}
      </span>
      <span className="min-w-0">
        <span className="block truncate font-sans text-[0.6rem] tracking-[0.2em] text-ink-muted uppercase md:text-[0.65rem]">
          {kindLabel}
        </span>
        <span className="block truncate font-sans text-xs text-ink md:text-sm">{title}</span>
      </span>
    </span>
  );
}

/* Descenso por capas: lo sensible se ve al abrir; el relato y la
   memoria aparecen solo cuando el usuario decide bajar. El panel se
   monta de nuevo en cada apertura, así que siempre empieza arriba. */
function LayerDescent({ layers }) {
  const available = LAYERS.filter((layer) => layers[layer.id]);
  const [depth, setDepth] = useState(1);
  const next = available[depth];

  return (
    <div className="mt-6 flex flex-col gap-4">
      <AnimatePresence initial={false}>
        {available.slice(0, depth).map((layer) => (
          <motion.section
            key={layer.id}
            initial={{ opacity: 0, y: 12, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            transition={{ duration: 0.5, ease: EASE_FLUIDO }}
            className="overflow-hidden border-l-2 pl-4"
            style={{ borderColor: SIGNS[layer.sign].color }}
          >
            <p className="font-sans text-xs tracking-[0.24em] uppercase" style={{ color: SIGNS[layer.sign].color }}>
              {layer.label}
            </p>
            <p className="mt-1 text-base text-ink-soft">{layers[layer.id]}</p>
          </motion.section>
        ))}
      </AnimatePresence>

      {next && (
        <motion.button
          type="button"
          onClick={() => setDepth((d) => d + 1)}
          whileTap={{ scale: 0.96 }}
          className="inline-flex min-h-11 w-max items-center gap-2 rounded-full border px-4 py-1.5 font-sans text-sm transition-colors hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-accent"
          style={{ borderColor: SIGNS[next.sign].color, color: SIGNS[next.sign].color }}
        >
          <ChevronDown className="size-4" strokeWidth={1.75} aria-hidden="true" />
          {next.action}
        </motion.button>
      )}
    </div>
  );
}
