import {
  AudioLines,
  Camera,
  Clapperboard,
  Ear,
  GraduationCap,
  Hammer,
  Landmark,
  Mic,
  ScrollText,
  ShoppingBag,
  Users,
  Wind,
} from "lucide-react";
import logoBosqueSonoro from "../assets/aliados/bosque-sonoro.svg";
import logoHuellaAndina from "../assets/aliados/huella-andina.svg";
import logoMuseoAgua from "../assets/aliados/museo-agua.svg";
import logoPolinizar from "../assets/aliados/polinizar.svg";
import logoSemillasParamo from "../assets/aliados/semillas-paramo.svg";

/* ============================================================
   portfolioData · Base de datos simulada del portafolio
   Solo datos estáticos (sin JSX): nodos del Territorio
   Rizomático (ontología en data/ontology.js), aliados y la URL
   del portafolio.
   Todo es contenido de ejemplo (sustituir por proyectos reales).
   ============================================================ */

/* ---------- Territorio Rizomático ---------- */

// Icono de cada formato. El formato solo decora; sin icono propio se usa el de su `kind` (data/ontology.js).
export const NODE_TYPE_ICONS = {
  Cortometraje: Clapperboard,
  Podcast: Mic,
  "Instagram Post": Camera,
  Manifiesto: ScrollText,
  Tienda: ShoppingBag,
  "Registro sonoro": AudioLines,
  "Paisaje sonoro": Wind,
  "Fotografía macro": Camera,
  "Memoria oral": Ear,
};

// Icono de cada tipo de actividad de un aliado (nodos con isExternal: true)
export const EVENT_TYPE_ICONS = {
  Taller: Hammer,
  Capacitación: GraduationCap,
  Encuentro: Users,
  Exposición: Landmark,
};

export const STORE_ID = "tienda";

// Portal oculto «El Observador»: destino del portafolio profesional (sustituir por tu subdominio)
export const PORTFOLIO_URL = "https://portafolio.lahuelladeloso.com";

/* Cada nodo es un objeto semiótico del territorio (vocabulario en data/ontology.js):
   - title, description  Nombre y resumen corto (la description se usa si no hay layers)
   - kind         Qué es en la red: "actante" | "rastro" | "artefacto" | "saber" |
                  "paisaje" | "observador". Por defecto "artefacto".
   - sign         Cómo significa sobre todo: "indice" | "icono" | "simbolo"
   - modes        Materias con que significa: ["sonoro", "visual", "tipografico",
                  "audiovisual", "oral", "corporal"]
   - entry        Índice de entrada: la pista que el usuario interpreta antes de leer.
                    { kind: "sonoro", cue: "ramas" | "agua" | "viento" | "canto" | "pasos",
                      label: "Qué se oye", src?: "/audio/archivo.mp3" }
                    { kind: "visual", glyph: "garras" | "huella" | "gota" | "frailejon" | "onda",
                      label: "Qué se ve", src?: "/img/foto.jpg" }
                  Sin src, el sonido se sintetiza y la imagen se dibuja en SVG.
   - layers       Capas que se revelan al descender: { sensible, relato, memoria }
   - agents       Quiénes significan aquí (humanos o no): ["oso andino", "encenillo"]
   - relations    Aristas tipadas: [{ to: "id", type: "deja-rastro", sign?, note? }]
                  Tipos: deja-rastro · cohabita · alimenta · resuena · traduce · nombra
   - connections  Raíces sin tipo (formato anterior; siguen funcionando)
   - concept      Territorio o tema que comparte con otras piezas
   - type         Formato de la pieza (Cortometraje, Podcast…): solo decora
   - link         Enlace externo (YouTube, Spotify…); embedLink para posts
   - xPos / yPos  Centro del nodo en el lienzo, en % (número o "20%").
                  Los observadores humanos van al margen (< 10 o > 90).
   Basta con declarar una relación en uno de los dos nodos.

   Nodos de aliados y marcas externas (isExternal: true):
   - brandName       Organización, colectivo o empresa
   - title           Nombre del taller, evento o capacitación
   - logoUrl         URL o import del logo (sin logo se muestran sus iniciales)
   - eventType       "Taller" | "Capacitación" | "Encuentro" | "Exposición"
   - theme           { bgColor, textColor, accentColor } en HEX/CSS. Solo
                     colorean su nodo, su ventana y las raíces que llegan a él.
                     Opcional: ctaTextColor (por defecto, bgColor).
   - contextSummary  Vínculo del evento con la narrativa inter-especie
   - externalLink    Sitio oficial o registro (se abre en pestaña nueva)
   - date, location  Opcionales. date admite ISO ("2026-11-14") o texto libre
   - connections     Raíces sin tipo hacia nodos propios

   Todo el contenido es de ejemplo: los saberes y memorias deben
   escribirse con las comunidades que los guardan, no por ellas. */
export const rhizomeNodes = [
  /* ---------- Meseta del Oso: se entra por un índice sonoro ---------- */
  {
    id: "meseta-oso",
    kind: "actante",
    sign: "indice",
    modes: ["sonoro", "corporal"],
    title: "Meseta del Oso",
    concept: "Territorio Andino",
    type: "Meseta",
    entry: { kind: "sonoro", cue: "ramas", label: "Ramas que se quiebran a 3.200 m de altitud" },
    description: "El oso andino no se presenta: se deja oír. Esta meseta se abre siguiendo lo que su cuerpo hace al bosque.",
    layers: {
      sensible: "Un crujido seco arriba, en el dosel. Luego otro. Algo pesado dobla las ramas para alcanzar las bromelias.",
      relato:
        "El oso construye plataformas en los árboles para comer y descansar. Cada rama rota es una frase de su recorrido diario, escrita para quien sepa leerla.",
      memoria:
        "Espacio para la palabra de quienes viven con el oso: cómo lo nombran, qué anuncia su paso, qué se le debe. (Ejemplo: escribir con la comunidad.)",
    },
    agents: ["oso andino", "bromelias", "dosel del bosque de niebla"],
    xPos: 42,
    yPos: 42,
    relations: [
      { to: "rastro-garras", type: "deja-rastro" },
      { to: "nodo-oso-andino", type: "deja-rastro", note: "La película sigue sus huellas, no lo persigue." },
      { to: "nodo-podcast-bosque", type: "deja-rastro", note: "Los guardabosques lo reconocen por sus sonidos." },
      { to: "paramo-respira", type: "cohabita" },
    ],
  },
  {
    id: "rastro-garras",
    kind: "rastro",
    sign: "indice",
    modes: ["visual"],
    title: "Garras en la corteza",
    concept: "Territorio Andino",
    type: "Fotografía macro",
    entry: { kind: "visual", glyph: "garras", label: "Macro del rastro de garras en la corteza de un encenillo" },
    description: "Cuatro surcos paralelos a la altura de un pecho humano: el oso trepó por aquí.",
    layers: {
      sensible: "Surcos claros sobre corteza oscura, todavía con savia. La separación entre ellos es la de una mano ancha.",
      relato: "El fototrampeo y la lectura de rastros permiten seguir al oso sin verlo: la cámara llega después que él.",
      memoria: "Quien rastrea aprende a leer la edad de una marca por su color. Ese saber no está en ningún manual.",
    },
    agents: ["oso andino", "encenillo"],
    xPos: 24,
    yPos: 30,
    relations: [
      { to: "nodo-ig-montana", type: "alimenta" },
      { to: "nodo-oso-andino", type: "alimenta" },
    ],
  },
  {
    id: "saber-pajaro-calla",
    kind: "saber",
    sign: "indice",
    modes: ["sonoro", "oral"],
    title: "El pájaro que se calla",
    concept: "Comunicación Inter-Especie",
    type: "Saber",
    entry: { kind: "sonoro", cue: "canto", label: "Un canto que se interrumpe de golpe" },
    description:
      "Los cazadores Runa no dominan al bosque: interpretan sus índices, como un pájaro que se calla, y proyectan otros que el bosque puede interpretar.",
    layers: {
      sensible: "Un canto insistente. Silencio. El silencio también es una señal, y significa algo para todos los que escuchan.",
      relato:
        "Comunicarse entre especies no es enseñarle a hablar al oso ni traducir su rugido. Es compartir una ecología de índices e íconos que varias especies pueden leer.",
      memoria: "Referencia: Eduardo Kohn, «Cómo piensan los bosques» (2013), sobre los Runa de Ávila, en la Amazonía ecuatoriana.",
    },
    agents: ["aves del sotobosque", "cazadores Runa", "oso andino"],
    xPos: 86,
    yPos: 12,
    relations: [
      { to: "meseta-oso", type: "resuena", sign: "indice", note: "El silencio de las aves anuncia que algo grande se acerca." },
      { to: "nodo-manifiesto", type: "resuena" },
    ],
  },
  {
    id: "saber-oso-montana",
    kind: "saber",
    sign: "simbolo",
    modes: ["oral", "tipografico"],
    title: "El oso que cuida la montaña",
    concept: "Territorio Andino",
    type: "Memoria oral",
    entry: { kind: "visual", glyph: "huella", label: "Una huella de cinco dedos trazada en la tierra" },
    description:
      "Mitos y cosmologías andinas del oso, registrados con soberanía visual: las comunidades deciden cómo se dibujan y se cuentan.",
    layers: {
      sensible: "Una huella dibujada con el dedo en la tierra húmeda, antes de empezar a contar.",
      relato:
        "En varios pueblos andinos el oso es un ser entre mundos: mitad gente, mitad monte. Aquí no se le asigna una etiqueta: se escucha cómo cada territorio lo nombra.",
      memoria: "Espacio reservado para relatos compartidos con permiso explícito de sus guardianes. (Ejemplo: sustituir.)",
    },
    agents: ["abuelas y abuelos narradores", "oso andino"],
    xPos: 66,
    yPos: 10,
    relations: [
      { to: "meseta-oso", type: "nombra" },
      { to: "nodo-manifiesto", type: "nombra", note: "El manifiesto cita sus principios de reciprocidad." },
    ],
  },

  /* ---------- Piezas del trabajo (artefactos multimodales) ---------- */
  {
    id: "nodo-oso-andino",
    kind: "artefacto",
    sign: "icono",
    modes: ["audiovisual"],
    title: "El rastro del Tremarctos",
    concept: "Territorio Andino",
    type: "Cortometraje",
    description:
      "Cortometraje que sigue las huellas del oso andino por el bosque de niebla, con la cámara a la altura de su mirada.",
    link: "https://youtube.com/tu-video",
    xPos: 30,
    yPos: 54,
    relations: [
      { to: "nodo-podcast-bosque", type: "resuena" },
      { to: "nodo-ig-montana", type: "resuena" },
      { to: "nodo-corto-agua", type: "resuena" },
      { to: STORE_ID, type: "alimenta", sign: "icono", note: "Su iconografía vuelve como prenda." },
    ],
  },
  {
    id: "nodo-podcast-bosque",
    kind: "artefacto",
    sign: "indice",
    modes: ["sonoro", "oral"],
    title: "Ecosonoro: Escuchar el bosque",
    concept: "Territorio Andino",
    type: "Podcast",
    description:
      "Episodio grabado en campo con guardabosques que reconocen al oso por los sonidos que deja a su paso.",
    link: "https://spotify.com/tu-episodio",
    xPos: 56,
    yPos: 30,
    relations: [{ to: "nodo-podcast-paramo", type: "resuena" }],
  },
  {
    id: "nodo-ig-montana",
    kind: "artefacto",
    sign: "icono",
    modes: ["visual", "tipografico"],
    title: "Diario de campo",
    concept: "Territorio Andino",
    type: "Instagram Post",
    description: "Carrusel con bocetos y fotografías del rodaje: el oso, los colibríes y las flores que ambos visitan.",
    embedLink: "https://instagram.com/p/tu-post",
    xPos: 78,
    yPos: 30,
    relations: [
      { to: "nodo-podcast-polinizadores", type: "resuena" },
      { to: STORE_ID, type: "alimenta", sign: "icono", note: "Los bocetos se vuelven estampados." },
    ],
  },
  {
    id: "nodo-podcast-paramo",
    kind: "artefacto",
    sign: "indice",
    modes: ["sonoro", "oral"],
    title: "Ecosonoro: Guardianes del páramo",
    concept: "Páramo y Agua",
    type: "Podcast",
    description: "Conversación con comunidades que protegen el páramo, la esponja que da agua a las ciudades.",
    link: "https://spotify.com/tu-episodio-paramo",
    xPos: 30,
    yPos: 78,
    relations: [
      { to: "nodo-corto-agua", type: "resuena" },
      { to: "nodo-ig-frailejones", type: "resuena" },
    ],
  },
  {
    id: "nodo-corto-agua",
    kind: "artefacto",
    sign: "icono",
    modes: ["audiovisual"],
    title: "Agua que baja",
    concept: "Páramo y Agua",
    type: "Cortometraje",
    description: "El recorrido de una gota desde el frailejón hasta el río, contado como un viaje entre especies.",
    link: "https://youtube.com/tu-video-agua",
    xPos: 52,
    yPos: 54,
    relations: [
      { to: "nodo-ig-frailejones", type: "resuena" },
      { to: "asmr-agua", type: "resuena" },
    ],
  },
  {
    id: STORE_ID,
    kind: "artefacto",
    sign: "icono",
    modes: ["visual", "corporal"],
    title: "Mini-Tienda",
    concept: "Territorio Andino",
    type: "Tienda",
    description: "Prendas personalizadas con la iconografía del territorio: cada diseño lleva una huella para vestir.",
    xPos: 74,
    yPos: 54,
  },
  {
    id: "nodo-ig-frailejones",
    kind: "artefacto",
    sign: "icono",
    modes: ["visual", "tipografico"],
    title: "Frailejones, relojes del páramo",
    concept: "Páramo y Agua",
    type: "Instagram Post",
    description: "Ilustración y micro-relato sobre el frailejón, que crece apenas un centímetro al año.",
    embedLink: "https://instagram.com/p/tu-post-frailejones",
    xPos: 52,
    yPos: 78,
    relations: [{ to: "nodo-podcast-polinizadores", type: "resuena" }],
  },
  {
    id: "nodo-podcast-polinizadores",
    kind: "artefacto",
    sign: "indice",
    modes: ["sonoro"],
    title: "Ecosonoro: Quién poliniza la montaña",
    concept: "Polinizadores",
    type: "Podcast",
    description: "Episodio sobre abejas nativas, colibríes y murciélagos que sostienen las flores de altura.",
    link: "https://spotify.com/tu-episodio-polinizadores",
    xPos: 74,
    yPos: 78,
  },
  {
    id: "nodo-manifiesto",
    kind: "artefacto",
    sign: "simbolo",
    modes: ["tipografico"],
    title: "Manifiesto Inter-Especie",
    concept: "Comunicación Inter-Especie",
    type: "Manifiesto",
    description:
      "Diez principios para narrar con otras especies y no solo sobre ellas: escuchar antes de grabar, ceder el encuadre, devolver al territorio.",
    link: "https://lahuelladeloso.com/manifiesto",
    xPos: 12,
    yPos: 21,
    relations: [
      { to: "nodo-oso-andino", type: "nombra" },
      { to: "nodo-podcast-bosque", type: "nombra" },
    ],
  },
  {
    id: "asmr-agua",
    kind: "artefacto",
    sign: "indice",
    modes: ["sonoro"],
    title: "Agua bajo el musgo",
    concept: "Páramo y Agua",
    type: "Registro sonoro",
    entry: { kind: "sonoro", cue: "agua", label: "Un hilo de agua que gotea bajo el musgo" },
    description: "Registro ASMR de agua, viento y biocenosis del páramo, sin voz humana: el territorio en primera persona.",
    layers: {
      sensible: "Gotas sobre musgo esponjoso. Un zumbido lejano. Nada más, durante doce minutos.",
      relato: "Grabado con hidrófono y micrófonos binaurales a la altura del suelo, la escala perceptual del agua y no la del oído humano.",
      memoria: "El páramo guarda el agua que beben las ciudades. Escucharlo es reconocer de dónde viene lo que nos sostiene.",
    },
    agents: ["musgo", "agua", "insectos del páramo"],
    link: "https://spotify.com/tu-registro-agua",
    xPos: 91,
    yPos: 76,
    relations: [{ to: "nodo-podcast-polinizadores", type: "cohabita" }],
  },

  /* ---------- Paisaje: el páramo también significa ---------- */
  {
    id: "paramo-respira",
    kind: "paisaje",
    sign: "indice",
    modes: ["sonoro", "visual"],
    title: "El páramo respira",
    concept: "Páramo y Agua",
    type: "Paisaje sonoro",
    entry: { kind: "sonoro", cue: "viento", label: "Viento que atraviesa los frailejones" },
    description: "El páramo no es fondo ni escenario: es un actor que regula el agua, la niebla y el ritmo de quienes lo habitan.",
    layers: {
      sensible: "Viento frío y constante. Las hojas peludas del frailejón amortiguan el sonido.",
      relato: "Los frailejones condensan la niebla y la convierten en agua que baja hacia el bosque y los ríos.",
      memoria: "Quienes cuidan los nacimientos de agua hablan del páramo como de alguien, no de algo.",
    },
    agents: ["páramo", "frailejones", "niebla"],
    xPos: 20,
    yPos: 91,
    relations: [
      { to: "asmr-agua", type: "deja-rastro" },
      { to: "nodo-podcast-paramo", type: "deja-rastro" },
      { to: "nodo-ig-frailejones", type: "cohabita" },
    ],
  },

  /* ---------- En el margen: humanos que observan y traducen ---------- */
  {
    id: "observador-guardabosque",
    kind: "observador",
    sign: "icono",
    modes: ["oral", "corporal"],
    title: "Guardabosques",
    concept: "Comunicación Inter-Especie",
    type: "Observador",
    description: "Leen rastros, instalan cámaras sin cortar rutas y traducen lo que el bosque dice a quienes no saben escucharlo.",
    xPos: 4,
    yPos: 58,
    relations: [
      { to: "rastro-garras", type: "traduce" },
      { to: "meseta-oso", type: "traduce" },
    ],
  },
  {
    id: "observador-quien-registra",
    kind: "observador",
    sign: "icono",
    modes: ["audiovisual", "sonoro"],
    title: "Quien registra",
    concept: "Comunicación Inter-Especie",
    type: "Observador",
    description: "La mirada que filma y graba este territorio. Está en el borde a propósito: escucha antes de encuadrar.",
    xPos: 96,
    yPos: 44,
    relations: [
      { to: "asmr-agua", type: "traduce" },
      { to: "nodo-ig-montana", type: "traduce" },
    ],
  },

  /* ---------- Aliados y marcas externas (ficticios, de ejemplo) ---------- */
  {
    id: "aliado-bosque-sonoro",
    isExternal: true,
    brandName: "Colectivo Bosque Sonoro",
    title: "Taller de escucha y grabación de campo",
    eventType: "Taller",
    logoUrl: logoBosqueSonoro,
    theme: { bgColor: "#1f3a2e", textColor: "#eaf4ec", accentColor: "#7fd3a8" },
    contextSummary:
      "Una jornada para aprender a grabar el bosque sin invadirlo. Los registros alimentan los próximos episodios de Ecosonoro y el archivo sonoro del manifiesto.",
    date: "2026-11-14",
    location: "Bosque de niebla · Cundinamarca",
    externalLink: "https://example.org/bosque-sonoro/taller",
    xPos: 38,
    yPos: 11,
    connections: ["nodo-podcast-bosque", "nodo-podcast-paramo", "nodo-manifiesto"],
  },
  {
    id: "aliado-huella-andina",
    isExternal: true,
    brandName: "Fundación Huella Andina",
    title: "Capacitación en fototrampeo ético",
    eventType: "Capacitación",
    logoUrl: logoHuellaAndina,
    theme: { bgColor: "#3b2a1e", textColor: "#f7ede2", accentColor: "#f2a65a" },
    contextSummary:
      "Guardabosques y comunidades aprenden a instalar cámaras trampa que respetan las rutas del oso andino. Parte del material aparece en «El rastro del Tremarctos».",
    date: "2027-02-06",
    location: "Páramo de Sumapaz",
    externalLink: "https://example.org/huella-andina/fototrampeo",
    xPos: 13,
    yPos: 43,
    connections: ["nodo-oso-andino", "nodo-manifiesto"],
  },
  {
    id: "aliado-semillas-paramo",
    isExternal: true,
    brandName: "Red Semillas de Páramo",
    title: "Encuentro de guardianas del agua",
    eventType: "Encuentro",
    logoUrl: logoSemillasParamo,
    theme: { bgColor: "#e9f1f7", textColor: "#16324a", accentColor: "#1f6fb2" },
    contextSummary:
      "Círculo de palabra entre mujeres que cuidan nacimientos de agua. Sus voces abren el episodio «Guardianes del páramo» y guían el recorrido de «Agua que baja».",
    date: "Marzo 2027",
    location: "Laguna de Guatavita",
    externalLink: "https://example.org/semillas-paramo/encuentro",
    xPos: 12,
    yPos: 72,
    connections: ["nodo-podcast-paramo", "nodo-corto-agua"],
  },
  {
    id: "aliado-museo-agua",
    isExternal: true,
    brandName: "Museo Vivo del Agua",
    title: "Exposición «Agua que baja»: sala sonora",
    eventType: "Exposición",
    logoUrl: logoMuseoAgua,
    theme: { bgColor: "#14213d", textColor: "#e5ecff", accentColor: "#7aa2ff" },
    contextSummary:
      "El cortometraje se proyecta junto a una sala de escucha con los sonidos del páramo y las ilustraciones de frailejones del diario de campo.",
    date: "2026-12-01",
    location: "Sala 3 · Museo Vivo del Agua",
    externalLink: "https://example.org/museo-vivo-del-agua/agua-que-baja",
    xPos: 40,
    yPos: 91,
    connections: ["nodo-corto-agua", "nodo-ig-frailejones"],
  },
  {
    id: "aliado-polinizar",
    isExternal: true,
    brandName: "Laboratorio Polinizar",
    title: "Taller de jardines para polinizadores",
    eventType: "Taller",
    // Sin logoUrl: el nodo muestra las iniciales de la marca
    theme: { bgColor: "#fff4d6", textColor: "#4a2c00", accentColor: "#b35c00" },
    contextSummary:
      "Diseñamos jardines urbanos para abejas nativas, colibríes y murciélagos, siguiendo las especies que aparecen en «Quién poliniza la montaña».",
    externalLink: "https://example.org/polinizar/jardines",
    xPos: 89,
    yPos: 56,
    connections: ["nodo-podcast-polinizadores", "nodo-ig-montana"],
  },
];
