import { motion, useMotionTemplate, useMotionValue, useReducedMotion } from "motion/react";
import { ArrowUpRight, Sprout } from "lucide-react";
import { EASE_FLUIDO } from "../../motion/animations.js";

/* ============================================================
   ProjectCard · Tarjeta de proyecto · Diseño Centrado en la Vida
   Superficie oscura con borde tenue, halo bioluminiscente al hover
   y etiquetas infográficas. Entrada fluida con motion.div.
   ============================================================ */

// Acentos tomados del tema en src/index.css
const ACCENTS = {
  teal: "var(--color-teal-500)",
  claro: "var(--color-teal-200)",
};

const cardVariants = {
  hidden: { opacity: 0, y: 28, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.9, ease: EASE_FLUIDO, staggerChildren: 0.06, delayChildren: 0.25 },
  },
};

const tagVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_FLUIDO } },
};

const isExternal = (href) => /^https?:\/\//.test(href ?? "");

export default function ProjectCard({
  title,
  subtitle,
  description,
  tags = [], // ej. ["PERSPECTIVA NO-HUMANA", "INTER-ESPECIE"]
  link,
  accent = "teal", // "teal" | "claro"
  className = "",
}) {
  const reduceMotion = useReducedMotion();
  const glow = ACCENTS[accent] ?? ACCENTS.teal;

  // Foco de luz que sigue al cursor dentro de la tarjeta
  const spotX = useMotionValue(-400);
  const spotY = useMotionValue(-400);
  const spotlight = useMotionTemplate`radial-gradient(320px circle at ${spotX}px ${spotY}px, color-mix(in oklab, var(--glow) 16%, transparent), transparent 70%)`;

  const onPointerMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    spotX.set(e.clientX - rect.left);
    spotY.set(e.clientY - rect.top);
  };

  return (
    <motion.article
      style={{ "--glow": glow }}
      className={`group relative isolate flex h-full flex-col overflow-hidden rounded-piedra border bg-morado-900 p-7 text-crema-base
        border-[color-mix(in_oklab,var(--glow)_14%,transparent)]
        shadow-[0_0_0_0_transparent] transition-[border-color,box-shadow] duration-(--duration-hover) ease-fluido
        hover:border-[color-mix(in_oklab,var(--glow)_55%,transparent)]
        hover:shadow-[0_0_48px_-12px_var(--glow),inset_0_0_24px_-16px_var(--glow)]
        focus-within:border-[color-mix(in_oklab,var(--glow)_55%,transparent)]
        focus-within:shadow-[0_0_48px_-12px_var(--glow)] ${className}`}
      variants={cardVariants}
      initial={reduceMotion ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
      whileHover={reduceMotion ? undefined : { y: -6 }}
      transition={{ duration: 0.4, ease: EASE_FLUIDO }}
      onPointerMove={reduceMotion ? undefined : onPointerMove}
    >
      {/* Capa de luz: solo visible al hover */}
      {!reduceMotion && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: spotlight }}
        />
      )}

      {/* Línea de energía superior */}
      <span
        aria-hidden="true"
        className="absolute inset-x-7 top-0 h-px bg-linear-to-r from-transparent via-(--glow) to-transparent opacity-40 transition-opacity duration-500 group-hover:opacity-100"
      />

      <header className="mb-5 flex items-center gap-2 font-sans text-xs tracking-[0.22em] text-(--glow) uppercase">
        <Sprout className="size-4" strokeWidth={1.5} aria-hidden="true" />
        <span className="font-sans">Diseño Centrado en la Vida</span>
      </header>

      <h3 className="text-xl text-crema-base">{title}</h3>
      {subtitle && <p className="mt-2 font-sans text-sm text-teal-200">{subtitle}</p>}
      {description && (
        <p className="mt-4 font-text text-sm leading-text text-[color-mix(in_oklab,var(--color-crema-base)_72%,transparent)]">
          {description}
        </p>
      )}

      {tags.length > 0 && (
        <ul className="mt-6 flex flex-wrap gap-2" aria-label="Etiquetas del proyecto">
          {tags.map((tag) => (
            <motion.li
              key={tag}
              variants={tagVariants}
              className="flex items-center gap-1.5 rounded-full border border-[color-mix(in_oklab,var(--glow)_30%,transparent)] bg-[color-mix(in_oklab,var(--glow)_8%,transparent)] px-3 py-1 font-sans text-[0.68rem] tracking-[0.18em] text-crema-base uppercase"
            >
              <span aria-hidden="true" className="size-1.5 rounded-full bg-(--glow) shadow-[0_0_6px_var(--glow)]" />
              {tag}
            </motion.li>
          ))}
        </ul>
      )}

      {link && (
        <a
          href={link}
          {...(isExternal(link) && { target: "_blank", rel: "noopener noreferrer" })}
          className="mt-auto inline-flex items-center gap-2 self-start pt-7 font-sans text-sm tracking-[0.14em] text-(--glow) uppercase outline-none
            after:absolute after:inset-0 after:content-[''] focus-visible:underline focus-visible:underline-offset-4"
        >
          Explorar proyecto
          <ArrowUpRight
            className="size-4 transition-transform duration-(--duration-hover) ease-fluido group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          {isExternal(link) && <span className="sr-only">(se abre en una pestaña nueva)</span>}
        </a>
      )}
    </motion.article>
  );
}
