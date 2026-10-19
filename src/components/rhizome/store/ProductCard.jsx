import { motion } from "motion/react";
import { EASE_FLUIDO } from "../../../motion/animations.js";
import { formatPrice } from "../../../data/storeData.js";
import ProductImage from "./ProductImage.jsx";

/* ============================================================
   ProductCard · Tarjeta del catálogo
   Toda la tarjeta es un botón que abre la ficha del producto.
   ============================================================ */

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_FLUIDO } },
};

export default function ProductCard({ product, onSelect }) {
  return (
    <motion.li variants={cardVariants}>
      <motion.button
        type="button"
        data-product-id={product.id}
        onClick={() => onSelect(product.id)}
        whileHover={{ y: -3 }}
        whileTap={{ scale: 0.98 }}
        className="group flex size-full flex-col overflow-hidden rounded-hoja border border-[color-mix(in_oklab,var(--color-teal-500)_25%,transparent)] bg-[color-mix(in_oklab,var(--color-morado-700)_70%,transparent)] text-left transition-colors hover:border-teal-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-200"
      >
        <ProductImage
          src={product.images[0]}
          alt=""
          fallback={product.fallback}
          className="aspect-square w-full shrink-0 transition-transform duration-500 ease-fluido group-hover:scale-[1.03]"
        />
        <span className="flex grow flex-col gap-1 p-3">
          <span className="font-display text-base leading-tight text-crema-base">{product.title}</span>
          <span className="mt-auto font-sans text-sm text-teal-200">{formatPrice(product.price)}</span>
        </span>
      </motion.button>
    </motion.li>
  );
}
