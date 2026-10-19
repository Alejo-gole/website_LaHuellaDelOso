/* ============================================================
   storeData · Catálogo de la Mini-Tienda (La Huella del Oso)
   Fuente única de prendas y del número de WhatsApp Business.
   Contenido de ejemplo: sustituir textos, precios e imágenes.
   ============================================================ */

// Número en formato internacional, solo dígitos (código de país + número).
// Reemplázalo por tu línea de WhatsApp Business.
export const WHATSAPP_NUMBER = "573000000000";

// Precio en pesos colombianos sin decimales → "$45.000"
export function formatPrice(value) {
  return `$${new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }).format(value)}`;
}

// Construye el enlace wa.me con el pedido prellenado y codificado
export function buildWhatsAppUrl({ product, size, color }) {
  const parts = [
    `Hola, me interesa adquirir la prenda: *${product.title}*`,
    `Talla: ${size}`,
    color && `Color: ${color}`,
    `Precio: ${formatPrice(product.price)}`,
  ].filter(Boolean);

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(parts.join(" - "))}`;
}

// Imágenes: Unsplash con temática botánica/oscura. Si una no carga
// (sin conexión o enlace roto), ProductImage muestra un respaldo con
// los colores del tema usando `fallback`.
const unsplash = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=70`;

export const STORE_PRODUCTS = [
  {
    id: "camiseta-rizoma-andino",
    title: "Camiseta Rizoma Andino",
    price: 45000,
    description:
      "Algodón orgánico peinado de 180 g, estampado en serigrafía a base de agua. Corte recto unisex con costuras reforzadas.",
    concept:
      "Las raíces no tienen centro: se extienden, se cruzan y se cuidan entre sí. El trazo dibuja una red subterránea de frailejones y hongos que sostiene el páramo.",
    images: [unsplash("photo-1441974231531-c6227db76b6e"), unsplash("photo-1518531933037-91b2f5f229cc")],
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Morado noche", swatch: "bg-morado-500" },
      { name: "Crema", swatch: "bg-crema-base" },
    ],
    fallback: "from-teal-700 to-morado-900",
  },
  {
    id: "sudadera-huella-del-oso",
    title: "Sudadera Huella del Oso",
    price: 120000,
    description:
      "Felpa perchada de algodón reciclado, capucha forrada y bolsillo canguro. Bordado frontal en hilo teal.",
    concept:
      "El oso andino camina sin dejar ruido, pero deja rastro. Esta huella es una invitación a leer el territorio con el cuerpo de otra especie.",
    images: [unsplash("photo-1501004318641-b39e6451bec6"), unsplash("photo-1470058869958-2a77ade41c02")],
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Morado noche", swatch: "bg-morado-500" },
      { name: "Bosque", swatch: "bg-teal-700" },
    ],
    fallback: "from-morado-500 to-morado-900",
  },
  {
    id: "camiseta-ecosonoro",
    title: "Camiseta Ecosonoro",
    price: 48000,
    description:
      "Algodón orgánico de 180 g con estampado de ondas sonoras en tinta que brilla tenuemente en la oscuridad.",
    concept:
      "Una grabación nocturna del bosque convertida en forma: cada pico es un grillo, una rana o el viento entre las hojas. Escuchar también es diseñar.",
    images: [unsplash("photo-1446071103084-c257b5f70672"), unsplash("photo-1502082553048-f009c37129b9")],
    sizes: ["S", "M", "L", "XL"],
    colors: [{ name: "Morado noche", swatch: "bg-morado-500" }],
    fallback: "from-teal-900 to-morado-700",
  },
  {
    id: "tote-topografia",
    title: "Tote Topografía",
    price: 35000,
    description:
      "Lona de algodón crudo de 12 oz, asas largas para llevar al hombro y bolsillo interno.",
    concept:
      "Curvas de nivel de la cuenca alta: un mapa para cargar lo cotidiano sin olvidar de dónde viene el agua.",
    images: [unsplash("photo-1523712999610-f77fbcfc3843")],
    sizes: ["Única"],
    colors: [{ name: "Crudo", swatch: "bg-crema-oscuro" }],
    fallback: "from-teal-500 to-teal-900",
  },
  {
    id: "camiseta-polinizadores",
    title: "Camiseta Polinizadores",
    price: 45000,
    description:
      "Algodón orgánico de 180 g, estampado a dos tintas. Corte entallado con manga corta.",
    concept:
      "Abejas nativas, colibríes y murciélagos: los mensajeros que hacen posible la flor. Un homenaje a los oficios invisibles del ecosistema.",
    images: [unsplash("photo-1497250681960-ef046c08a56e"), unsplash("photo-1520412099551-62b6bafeb5bb")],
    sizes: ["S", "M", "L"],
    colors: [
      { name: "Crema", swatch: "bg-crema-base" },
      { name: "Bosque", swatch: "bg-teal-700" },
    ],
    fallback: "from-teal-700 to-teal-900",
  },
  {
    id: "panuelo-espora",
    title: "Pañuelo Espora",
    price: 30000,
    description:
      "Algodón liviano de 55 × 55 cm con bordes cosidos a mano. Úsalo al cuello, en la cabeza o en la mochila.",
    concept:
      "La espora viaja ligera y germina donde encuentra humedad. Un objeto pequeño para llevar el bosque a cualquier parte.",
    images: [unsplash("photo-1485955900006-10f4d324d411")],
    sizes: ["Única"],
    colors: [
      { name: "Teal", swatch: "bg-teal-500" },
      { name: "Morado", swatch: "bg-morado-500" },
    ],
    fallback: "from-morado-700 to-teal-900",
  },
];
