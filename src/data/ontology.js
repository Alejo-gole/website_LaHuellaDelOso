import {
  AudioLines,
  Binoculars,
  Ear,
  Eye,
  Film,
  Footprints,
  Mountain,
  PawPrint,
  Sprout,
  Type,
} from "lucide-react";

/* ============================================================
   ontology · Vocabulario de la ontología rizomática
   La Huella del Oso no clasifica en árbol (categoría → artículo).
   Cada nodo es un objeto semiótico heterogéneo y cada arista dice
   CÓMO significa una relación, no solo que existe.

   Tres ejes, tomados de la semiótica de Peirce leída desde la
   biosemiótica (Kohn, Hoffmeyer):
   · SIGNS      Cómo significa algo: índice, ícono o símbolo.
                Cada signo tiene su color (tokens en index.css).
   · MODES      Con qué materia significa: sonido, imagen, letra…
   · LAYERS     Qué tan hondo se lee: de lo sensible a la memoria.
                El usuario desciende capa por capa al interactuar.
   Y dos catálogos:
   · NODE_KINDS Qué es el nodo dentro de la red del territorio.
   · RELATIONS  Tipos de arista (verbos), con su signo por defecto.
   Solo datos (sin JSX), como portfolioData.js.
   ============================================================ */

/* ---------- Signos: cómo significa una cosa ---------- */
export const SIGNS = {
  indice: {
    label: "Índice",
    plural: "Índices",
    color: "var(--color-cian)",
    dash: "1 5",
    hint: "Significa por contacto: la rama rota está porque alguien pasó.",
  },
  icono: {
    label: "Ícono",
    plural: "Íconos",
    color: "var(--color-violeta)",
    dash: "7 5",
    hint: "Significa por semejanza: una forma que se parece a lo que evoca.",
  },
  simbolo: {
    label: "Símbolo",
    plural: "Símbolos",
    color: "var(--color-carmesi)",
    dash: undefined, // trazo continuo: la convención no deja huecos
    hint: "Significa por acuerdo: una palabra, un nombre, un mito.",
  },
};

export const SIGN_ORDER = ["indice", "icono", "simbolo"];

/* ---------- Modos de representación ---------- */
export const MODES = {
  sonoro: { label: "Sonoro", icon: AudioLines },
  visual: { label: "Visual", icon: Eye },
  audiovisual: { label: "Audiovisual", icon: Film },
  tipografico: { label: "Tipográfico", icon: Type },
  oral: { label: "Memoria oral", icon: Ear },
  corporal: { label: "Corporal", icon: Footprints },
};

/* ---------- Capas de significado (andamiaje de interacción) ----------
   Se revelan en orden: la primera al mirar o escuchar el índice de
   entrada; las siguientes cuando el usuario decide descender. */
export const LAYERS = [
  { id: "sensible", label: "Lo sensible", sign: "indice", action: "Escuchar y mirar" },
  { id: "relato", label: "El relato", sign: "icono", action: "Descender al relato" },
  { id: "memoria", label: "La memoria", sign: "simbolo", action: "Descender a la memoria" },
];

/* ---------- Clases de nodo ----------
   margin: true → el nodo vive en el borde del territorio (el humano
   observa y traduce; no ocupa el centro de la red). */
export const NODE_KINDS = {
  actante: { label: "Actante no-humano", icon: PawPrint },
  rastro: { label: "Rastro del territorio", icon: Footprints },
  artefacto: { label: "Artefacto multimodal", icon: AudioLines },
  saber: { label: "Saber y memoria local", icon: Sprout },
  paisaje: { label: "Paisaje", icon: Mountain },
  observador: { label: "Observador · traductor", icon: Binoculars, margin: true },
};

export const DEFAULT_KIND = "artefacto";

/* ---------- Aristas tipadas ----------
   label  Verbo leído desde el nodo que declara la relación.
   back   El mismo vínculo leído desde el otro extremo.
   sign   Signo por defecto (una arista puede sobrescribirlo). */
export const RELATIONS = {
  "deja-rastro": { label: "deja rastro en", back: "guarda el rastro de", sign: "indice" },
  cohabita: { label: "cohabita con", back: "cohabita con", sign: "indice" },
  alimenta: { label: "alimenta a", back: "se nutre de", sign: "indice" },
  resuena: { label: "resuena con", back: "resuena con", sign: "icono" },
  traduce: { label: "traduce a", back: "es escuchado por", sign: "icono" },
  nombra: { label: "nombra a", back: "es nombrado por", sign: "simbolo" },
  // `connections` sin tipo (nodos antiguos y aliados)
  raiz: { label: "conecta con", back: "conecta con", sign: null },
};
