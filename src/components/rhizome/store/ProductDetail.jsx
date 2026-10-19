import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { MessageCircle } from "lucide-react";
import { EASE_FLUIDO } from "../../../motion/animations.js";
import { buildWhatsAppUrl, formatPrice } from "../../../data/storeData.js";
import ProductImage from "./ProductImage.jsx";

/* ============================================================
   ProductDetail · Ficha técnica dentro del cajón
   Galería, selector de talla y color, narrativa del diseño y
   compra vía WhatsApp con el pedido prellenado.
   ============================================================ */

function OptionGroup({ label, children }) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 font-sans text-xs tracking-[0.2em] text-teal-200 uppercase">{label}</legend>
      <div className="flex flex-wrap gap-2">{children}</div>
    </fieldset>
  );
}

function Gallery({ product }) {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const { images, title, fallback } = product;

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-piedra">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            key={active}
            initial={{ opacity: 0, scale: reduceMotion ? 1 : 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: EASE_FLUIDO }}
            className="absolute inset-0"
          >
            <ProductImage
              src={images[active]}
              alt={`${title}, imagen ${active + 1} de ${images.length}`}
              fallback={fallback}
              loading="eager"
              className="size-full"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {images.length > 1 && (
        <ul className="flex gap-2" aria-label="Imágenes de la prenda">
          {images.map((src, i) => (
            <li key={src}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Ver imagen ${i + 1}`}
                aria-current={i === active}
                className={`block size-16 overflow-hidden rounded-hoja border-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-200 ${
                  i === active ? "border-teal-500" : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <ProductImage src={src} alt="" fallback={fallback} className="size-full" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function ProductDetail({ product }) {
  // Talla única: se preselecciona; si no, el cliente debe elegir
  const [size, setSize] = useState(product.sizes.length === 1 ? product.sizes[0] : null);
  const [color, setColor] = useState(product.colors?.[0]?.name ?? null);
  const [showHint, setShowHint] = useState(false);

  const ready = Boolean(size);
  const whatsappUrl = ready ? buildWhatsAppUrl({ product, size, color }) : undefined;

  const handleBuy = (e) => {
    if (ready) return;
    e.preventDefault();
    setShowHint(true);
  };

  return (
    <article className="flex flex-col gap-6" aria-labelledby="producto-titulo">
      <Gallery product={product} />

      <header className="flex flex-col gap-2">
        <h3 id="producto-titulo" className="text-xl text-crema-base">
          {product.title}
        </h3>
        <p className="font-sans text-lg text-teal-200">{formatPrice(product.price)}</p>
      </header>

      <OptionGroup label="Talla">
        {product.sizes.map((s) => {
          const selected = s === size;
          return (
            <motion.button
              key={s}
              type="button"
              aria-pressed={selected}
              onClick={() => {
                setSize(s);
                setShowHint(false);
              }}
              whileTap={{ scale: 0.94 }}
              className={`min-w-12 rounded-full border px-4 py-2 font-sans text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-200 ${
                selected
                  ? "border-teal-500 bg-teal-500 text-crema-base"
                  : "border-[color-mix(in_oklab,var(--color-teal-500)_40%,transparent)] text-crema-base hover:border-teal-200"
              }`}
            >
              {s}
            </motion.button>
          );
        })}
      </OptionGroup>

      {product.colors?.length > 0 && (
        <OptionGroup label={`Color · ${color}`}>
          {product.colors.map((c) => {
            const selected = c.name === color;
            return (
              <button
                key={c.name}
                type="button"
                aria-pressed={selected}
                aria-label={c.name}
                title={c.name}
                onClick={() => setColor(c.name)}
                className={`size-9 rounded-full border-2 ring-2 ring-offset-2 ring-offset-morado-900 transition-shadow focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-200 ${c.swatch} ${
                  selected ? "border-morado-900 ring-teal-500" : "border-transparent ring-transparent"
                }`}
              />
            );
          })}
        </OptionGroup>
      )}

      <div className="flex flex-col gap-2">
        <motion.a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          role={ready ? undefined : "button"}
          aria-disabled={!ready}
          tabIndex={ready ? undefined : 0}
          onKeyDown={(e) => !ready && (e.key === "Enter" || e.key === " ") && handleBuy(e)}
          aria-describedby={showHint ? "talla-aviso" : undefined}
          onClick={handleBuy}
          whileHover={ready ? { y: -2 } : undefined}
          whileTap={{ scale: 0.97 }}
          animate={showHint ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
          transition={{ duration: 0.4 }}
          className={`flex items-center justify-center gap-2 rounded-full px-6 py-4 font-sans text-base shadow-fuerte transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-200 ${
            ready
              ? "cursor-pointer bg-teal-500 text-crema-base hover:bg-teal-700"
              : "cursor-not-allowed bg-[color-mix(in_oklab,var(--color-teal-500)_35%,transparent)] text-crema-base/70"
          }`}
        >
          <MessageCircle className="size-5" strokeWidth={1.75} aria-hidden="true" />
          Adquirir vía WhatsApp
        </motion.a>
        <p id="talla-aviso" aria-live="polite" className="min-h-5 font-sans text-xs text-teal-200">
          {showHint ? "Elige una talla para continuar." : ready ? "Se abrirá WhatsApp con tu pedido listo." : ""}
        </p>
      </div>

      <section className="flex flex-col gap-2">
        <h4 className="text-xs tracking-[0.2em] text-teal-200 uppercase">La prenda</h4>
        <p className="font-text text-sm leading-text text-crema-base/85">{product.description}</p>
      </section>

      <section className="flex flex-col gap-2 rounded-piedra border border-[color-mix(in_oklab,var(--color-teal-500)_25%,transparent)] bg-[color-mix(in_oklab,var(--color-morado-700)_60%,transparent)] p-5">
        <h4 className="text-xs tracking-[0.2em] text-teal-200 uppercase">Concepto</h4>
        <p className="font-text text-sm leading-text text-crema-base/85 italic">{product.concept}</p>
      </section>
    </article>
  );
}
