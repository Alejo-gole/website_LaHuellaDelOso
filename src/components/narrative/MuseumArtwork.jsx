import { motion, useReducedMotion } from "motion/react";
import { EASE_FLUIDO } from "../../motion/animations.js";

/* ============================================================
   MuseumArtwork · Obra expuesta en el Museo
   Imagen protagonista + ficha técnica (cartela de museo).
   Sin cristal ni bordes: solo la pieza y su información.

   Props
   - title             Nombre de la obra
   - role              Rol desempeñado
   - techStack         Array de técnicas / tecnologías
   - imagePlaceholder  URL de imagen, o un texto descriptivo que
                       se dibuja como composición de marcador
   - index             Número de catálogo (opcional, 1, 2, 3…)
   - year              Año (opcional)
   - description       Texto breve de sala (opcional)
   - layout            "side" (ficha al lado en escritorio) | "below"
   ============================================================ */

const isImageSource = (value) =>
  typeof value === "string" && /^(https?:|data:|blob:|\.{0,2}\/)/.test(value);

/* Composiciones geométricas de marcador: solo tokens del tema,
   para que funcionen igual en claro y en oscuro */
const COMPOSITIONS = [
  // Disco + plinto
  (
    <>
      <span className="absolute top-[18%] left-[22%] aspect-square w-[46%] rounded-full bg-accent" />
      <span className="absolute right-[16%] bottom-[14%] h-[38%] w-[30%] bg-ink" />
    </>
  ),
  // Forma orgánica + horizonte
  (
    <>
      <span className="shape-blob absolute top-[14%] right-[18%] aspect-square w-[52%] bg-ink" />
      <span className="absolute inset-x-[12%] bottom-[22%] h-px bg-accent" />
      <span className="absolute bottom-[12%] left-[12%] aspect-square w-[14%] rounded-full bg-accent" />
    </>
  ),
  // Retícula de interfaz
  (
    <>
      <span className="absolute inset-x-[14%] top-[16%] h-[10%] bg-ink" />
      <span className="absolute top-[32%] left-[14%] h-[52%] w-[34%] bg-accent" />
      <span className="absolute top-[32%] right-[14%] h-[24%] w-[44%] bg-line" />
      <span className="absolute right-[14%] bottom-[16%] h-[24%] w-[44%] bg-line" />
    </>
  ),
  // Sistema de nodos
  (
    <>
      <span className="absolute top-1/2 left-[14%] h-px w-[72%] bg-ink-muted" />
      <span className="absolute top-[18%] left-1/2 h-[64%] w-px bg-ink-muted" />
      <span className="absolute top-[42%] left-[42%] aspect-square w-[16%] rounded-full bg-accent" />
      <span className="absolute top-[14%] left-[46%] aspect-square w-[8%] rounded-full bg-ink" />
      <span className="absolute top-[46%] left-[10%] aspect-square w-[8%] rounded-full bg-ink" />
      <span className="absolute right-[10%] bottom-[30%] aspect-square w-[10%] rounded-full bg-ink" />
    </>
  ),
];

function PlaceholderArt({ label, variant }) {
  return (
    <div aria-hidden="true" className="absolute inset-0 bg-surface-hover">
      {COMPOSITIONS[variant % COMPOSITIONS.length]}
      <span className="absolute bottom-4 left-4 font-sans text-xs tracking-[0.2em] text-ink-muted uppercase">
        {label}
      </span>
    </div>
  );
}

function FichaRow({ label, children }) {
  return (
    <div className="grid grid-cols-[6.5rem_1fr] gap-4 border-t border-line py-3 first:border-t-0">
      <dt className="font-sans text-xs tracking-[0.2em] text-ink-muted uppercase">{label}</dt>
      <dd className="font-text text-sm text-ink-soft">{children}</dd>
    </div>
  );
}

export default function MuseumArtwork({
  title,
  role,
  techStack = [],
  imagePlaceholder,
  index,
  year,
  description,
  layout = "side",
  className = "",
}) {
  const reduceMotion = useReducedMotion();
  const catalogo = index != null ? String(index).padStart(2, "0") : null;
  const side = layout === "side";

  return (
    <motion.article
      initial={{ opacity: 0, y: reduceMotion ? 0 : 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, ease: EASE_FLUIDO }}
      className={`group grid gap-6 ${side ? "md:grid-cols-[minmax(0,1fr)_17rem] md:items-end md:gap-10" : ""} ${className}`}
    >
      <figure className="relative aspect-[4/5] overflow-hidden md:aspect-auto md:h-[min(60dvh,38rem)]">
        <motion.div
          className="absolute inset-0"
          whileHover={reduceMotion ? undefined : { scale: 1.03 }}
          transition={{ duration: 0.9, ease: EASE_FLUIDO }}
        >
          {isImageSource(imagePlaceholder) ? (
            <img src={imagePlaceholder} alt={title} loading="lazy" className="size-full object-cover" />
          ) : (
            <PlaceholderArt label={imagePlaceholder ?? title} variant={(index ?? 1) - 1} />
          )}
        </motion.div>
        <figcaption className="sr-only">{title}</figcaption>
      </figure>

      <div className="max-w-md">
        {catalogo && (
          <p className="mb-3 font-sans text-xs tracking-[0.28em] text-accent uppercase">Obra {catalogo}</p>
        )}
        <h3 className="text-xl text-ink md:text-2xl">{title}</h3>
        {description && <p className="mt-3 font-text text-sm text-ink-soft">{description}</p>}

        <dl className="mt-6 border-t border-ink">
          <FichaRow label="Rol">{role}</FichaRow>
          {techStack.length > 0 && (
            <FichaRow label="Técnica">
              <ul className="flex flex-wrap gap-x-3 gap-y-1">
                {techStack.map((tech, i) => (
                  <li key={tech} className="font-text">
                    {tech}
                    {i < techStack.length - 1 && <span aria-hidden="true" className="ml-3 text-ink-muted">/</span>}
                  </li>
                ))}
              </ul>
            </FichaRow>
          )}
          {year && <FichaRow label="Año">{year}</FichaRow>}
        </dl>
      </div>
    </motion.article>
  );
}
