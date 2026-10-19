import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ShoppingBag, X } from "lucide-react";
import { STORE_PRODUCTS } from "../../data/storeData.js";
import { EASE_FLUIDO } from "../../motion/animations.js";
import ProductCard from "./store/ProductCard.jsx";
import ProductDetail from "./store/ProductDetail.jsx";
import NodeDrawer, { DrawerScroll } from "./NodeDrawer.jsx";

/* ============================================================
   MerchStoreDrawer · Mini-Tienda conectada a WhatsApp Business
   Vive en NodeDrawer, como el resto de paneles del rizoma:
   · Escritorio: cajón que se desliza desde la derecha.
   · Móvil: hoja inferior flotante (85dvh) sobre un velo morado con
     blur; se cierra arrastrándola hacia abajo desde el asa o la
     cabecera. Arriba queda visible, abstracta, la red rizomática.
   Dos vistas internas: catálogo y ficha de producto.
   Siempre morado oscuro con texto crema (en ambos temas).
   Se renderiza en [data-overlay-root]. Esc o clic fuera cierra.
   ============================================================ */

// Desplazamiento entre vistas: el detalle entra desde la derecha,
// el catálogo regresa desde la izquierda
const viewVariants = {
  enter: (dir) => ({ opacity: 0, x: dir * 40 }),
  center: { opacity: 1, x: 0 },
  exit: (dir) => ({ opacity: 0, x: dir * -40 }),
};

function Catalog({ products, onSelect, reduceMotion }) {
  return (
    <motion.ul
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: reduceMotion ? 0 : 0.06, delayChildren: 0.15 } },
      }}
      className="grid auto-rows-max grid-cols-2 gap-4"
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onSelect={onSelect} />
      ))}
    </motion.ul>
  );
}

// Contenido del cajón: solo existe mientras está abierto, así que
// la vista y las selecciones se reinician en cada apertura
function StorePanel({ products, onClose }) {
  const reduceMotion = useReducedMotion();
  const [selectedId, setSelectedId] = useState(null);
  const [direction, setDirection] = useState(1);
  const closeRef = useRef(null);
  const backRef = useRef(null);
  const scrollRef = useRef(null);
  const lastOpenedRef = useRef(null);
  const selectedIdRef = useRef(null);

  const product = products.find((p) => p.id === selectedId) ?? null;

  // Escape cierra; foco al botón X al abrir y de vuelta al nodo al cerrar
  useEffect(() => {
    const returnTo = document.activeElement;
    closeRef.current?.focus({ preventScroll: true });
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      returnTo?.focus?.({ preventScroll: true });
    };
  }, [onClose]);

  const openProduct = (id) => {
    lastOpenedRef.current = id;
    setDirection(1);
    selectedIdRef.current = id;
    setSelectedId(id);
  };

  const backToCatalog = () => {
    setDirection(-1);
    selectedIdRef.current = null;
    setSelectedId(null);
  };

  // Tras cambiar de vista: volver arriba y llevar el foco a un sitio
  // coherente (botón Volver en la ficha, la tarjeta abierta en el catálogo).
  const handleViewChanged = () => {
    if (selectedIdRef.current) {
      backRef.current?.focus({ preventScroll: true });
    } else if (lastOpenedRef.current) {
      scrollRef.current?.querySelector(`[data-product-id="${lastOpenedRef.current}"]`)?.focus();
    }
  };

  return (
    <>
      {/* Cabecera: también es zona de agarre de la hoja en móvil */}
      <header data-sheet-grip className="flex shrink-0 touch-none items-start justify-between gap-4 px-6 pb-4 md:touch-auto md:pt-6">
        <div className="min-w-0">
          <AnimatePresence mode="wait" initial={false}>
            {product ? (
              <motion.button
                key="volver"
                ref={backRef}
                type="button"
                onClick={backToCatalog}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.25 }}
                className="-ml-2 flex min-h-11 items-center gap-2 rounded-full px-2 py-1 font-sans text-xs tracking-[0.24em] text-teal-200 uppercase transition-colors hover:text-crema-base focus-visible:outline-2 focus-visible:outline-teal-500"
              >
                <ArrowLeft className="size-4" strokeWidth={1.75} aria-hidden="true" />
                Volver al catálogo
              </motion.button>
            ) : (
              <motion.p
                key="etiqueta"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.25 }}
                className="flex items-center gap-2 py-1 font-sans text-xs tracking-[0.24em] text-teal-200 uppercase"
              >
                <ShoppingBag className="size-4" strokeWidth={1.5} aria-hidden="true" />
                Mini-Tienda
              </motion.p>
            )}
          </AnimatePresence>
          <h2 id="tienda-titulo" className="mt-2 text-2xl text-crema-base">
            Prendas del territorio
          </h2>
        </div>
        <motion.button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Cerrar tienda"
          whileHover={reduceMotion ? undefined : { rotate: 90 }}
          whileTap={{ scale: 0.94 }}
          transition={{ duration: 0.3, ease: EASE_FLUIDO }}
          className="grid size-11 shrink-0 place-items-center rounded-full border border-[color-mix(in_oklab,var(--color-teal-500)_35%,transparent)] text-teal-200 transition-colors hover:bg-morado-700 hover:text-crema-base focus-visible:outline-2 focus-visible:outline-teal-500"
        >
          <X className="size-5" strokeWidth={1.75} aria-hidden="true" />
        </motion.button>
      </header>

      <DrawerScroll ref={scrollRef} className="px-6 pb-10">
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={product ? product.id : "catalogo"}
            custom={direction}
            variants={viewVariants}
            initial={reduceMotion ? { opacity: 0 } : "enter"}
            animate={reduceMotion ? { opacity: 1 } : "center"}
            exit={reduceMotion ? { opacity: 0 } : "exit"}
            transition={{ duration: 0.35, ease: EASE_FLUIDO }}
            onAnimationStart={() => scrollRef.current?.scrollTo({ top: 0 })}
            onAnimationComplete={handleViewChanged}
          >
            {product ? (
              <ProductDetail product={product} />
            ) : (
              <Catalog products={products} onSelect={openProduct} reduceMotion={reduceMotion} />
            )}
          </motion.div>
        </AnimatePresence>
      </DrawerScroll>
    </>
  );
}

export default function MerchStoreDrawer({ isOpen, onClose, products = STORE_PRODUCTS }) {
  return (
    <NodeDrawer
      open={isOpen}
      onClose={onClose}
      labelledBy="tienda-titulo"
      desktop="side"
      desktopVeil="md:bg-morado-900/45 md:backdrop-blur-sm"
      className="border border-teal-500/30 bg-morado-900 text-crema-base"
    >
      <StorePanel products={products} onClose={onClose} />
    </NodeDrawer>
  );
}
