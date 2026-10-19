import { useCallback, useRef, useState } from "react";
import { Hand } from "lucide-react";
import InteractiveMap from "../components/rhizome/InteractiveMap.jsx";
import ObserverPortal from "../components/rhizome/ObserverPortal.jsx";
import ExternalBrandNode from "../components/rhizome/ExternalBrandNode.jsx";
import MerchStoreDrawer from "../components/rhizome/MerchStoreDrawer.jsx";
import PlateauNode from "../components/rhizome/PlateauNode.jsx";
import SemioticLegend from "../components/rhizome/SemioticLegend.jsx";
import { isListening, playCue } from "../audio/soundCues.js";
import { DEFAULT_KIND, MODES, NODE_KINDS } from "../data/ontology.js";
import { EVENT_TYPE_ICONS, NODE_TYPE_ICONS, STORE_ID, rhizomeNodes } from "../data/portfolioData.js";
import useMediaQuery, { DESKTOP_QUERY } from "../hooks/useMediaQuery.js";
import useRhizomeGraph from "../hooks/useRhizomeGraph.js";

/* ============================================================
   RhizomeMap · Territorio Rizomático
   Los nodos (data/portfolioData.js → rhizomeNodes) se unen por
   concepto mediante `connections`, no por formato.
   Un solo territorio espacial en todos los tamaños: InteractiveMap
   (lienzo arrastrable más grande que la pantalla) dibuja las raíces;
   al seleccionar o señalar un nodo, sus raíces y nodos conectados
   brillan. En el smartphone el mapa no se colapsa en lista: se
   compacta (lienzo y tarjetas más pequeños, nodos al alcance del
   pulgar) y se recorre arrastrando con el dedo.
   El panel de cada nodo (cajón lateral en escritorio, hoja inferior
   en móvil) lista sus conexiones y permite saltar a ellas; el
   lienzo se desliza hasta el nodo elegido. El nodo "Tienda" abre
   MerchStoreDrawer.
   Los nodos con isExternal (aliados y marcas) se pintan con
   ExternalBrandNode, que abre su ExternalNodeModal.
   En una esquina del lienzo se esconde ObserverPortal, el paso
   hacia el portafolio profesional.
   Ontología (data/ontology.js): las aristas son tipadas y se pintan
   por signo; SemioticLegend apaga capas de signos y activa la
   escucha; los nodos con entry se abren por su índice sonoro o
   visual; los observadores humanos van al margen del lienzo.
   ============================================================ */

export default function RhizomeMap() {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const graph = useRhizomeGraph(rhizomeNodes);
  const [selectedId, setSelectedId] = useState(null);
  const [isStoreOpen, setIsStoreOpen] = useState(false);
  const closeStore = useCallback(() => setIsStoreOpen(false), []);
  const [hiddenSigns, setHiddenSigns] = useState(() => new Set());

  const toggleSign = (sign) =>
    setHiddenSigns((current) => {
      const next = new Set(current);
      next.has(sign) ? next.delete(sign) : next.add(sign);
      return next;
    });

  // Saltar a un nodo conectado (propio o aliado); la Tienda abre su cajón en lugar del panel
  const navigate = (id) => {
    if (id === STORE_ID) {
      setSelectedId(null);
      setIsStoreOpen(true);
      return;
    }
    setSelectedId(id);
  };

  // Devuelve false para que el nodo Tienda no abra su panel propio
  const openStore = () => {
    setIsStoreOpen(true);
    return false;
  };

  return (
    <>
      <Territory
        compact={!isDesktop}
        graph={graph}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onNavigate={navigate}
        onOpenStore={openStore}
        hiddenSigns={hiddenSigns}
        onToggleSign={toggleSign}
      />
      <MerchStoreDrawer isOpen={isStoreOpen} onClose={closeStore} />
    </>
  );
}

function Heading({ className = "" }) {
  return (
    <header className={className}>
      <p className="mb-1 font-sans text-xs tracking-[0.28em] text-accent uppercase md:mb-2">Mundo 01</p>
      <h1 id="rizoma-titulo" className="text-xl text-ink md:text-3xl">
        Territorio Rizomático
      </h1>
    </header>
  );
}

// Cada tipo de nodo pinta su propio componente
const nodeComponent = (node) => (node.isExternal ? ExternalBrandNode : PlateauNode);

// Índice sonoro: suena al señalar un nodo solo si el usuario activó la escucha
function cue(entry, { force = false } = {}) {
  if (entry?.kind !== "sonoro") return;
  if (force || isListening()) playCue(entry);
}

const kindOf = (node) => NODE_KINDS[node.kind ?? DEFAULT_KIND] ?? NODE_KINDS[DEFAULT_KIND];
const nodeIcon = (node) => NODE_TYPE_ICONS[node.type] ?? kindOf(node).icon;

// Resumen de un nodo para las listas de raíces de los paneles; `link` es la arista leída desde el nodo abierto
function toConnection(node, link) {
  const relation = link.type === "raiz" ? {} : { verb: link.verb, sign: link.sign };
  if (node.isExternal) {
    return { id: node.id, title: node.title, type: `${node.eventType} · ${node.brandName}`, icon: EVENT_TYPE_ICONS[node.eventType], ...relation };
  }
  return { id: node.id, title: node.title, type: node.type, icon: nodeIcon(node), ...relation };
}

// Props de cada nodo: datos propios + estado abierto, conexiones navegables y resaltado
function nodeProps({ node, index, graph, activeId, selectedId, onSelect, onNavigate, hiddenSigns }) {
  const { id, connections: _ids, relations: _relations, kind: _kind, modes = [], ...data } = node;
  const linked = activeId !== null && graph.neighbors[activeId]?.has(id);
  const activeNode = activeId !== null ? graph.byId[activeId] : null;

  const ownData = node.isExternal
    ? { ...data, eventIcon: EVENT_TYPE_ICONS[node.eventType] }
    : {
        ...data,
        category: node.type,
        icon: nodeIcon(node),
        link: node.link ?? node.embedLink,
        kindLabel: kindOf(node).label,
        margin: Boolean(kindOf(node).margin),
        modes: modes.filter((mode) => MODES[mode]).map((mode) => ({ id: mode, ...MODES[mode] })),
        dimmed: hiddenSigns.has(node.sign),
        onCue: cue,
        // Si el activo es un aliado, sus nodos conectados brillan con su acento
        highlightColor: activeNode?.isExternal ? activeNode.theme?.accentColor : undefined,
      };

  return {
    ...ownData,
    index,
    open: selectedId === id,
    onOpenChange: (open) => onSelect(open ? id : null),
    connections: graph.links[id].map((link) => toConnection(graph.byId[link.id], link)),
    onNavigate,
    highlight: activeId === id ? "active" : linked ? "linked" : null,
  };
}

// Punto focal de entrada en móvil: la primera meseta del territorio queda en el centro de la pantalla
const FOCUS = [parseFloat(rhizomeNodes[0]?.xPos ?? 50), parseFloat(rhizomeNodes[0]?.yPos ?? 50)];

function Territory({ compact, graph, selectedId, onSelect, onNavigate, onOpenStore, hiddenSigns, onToggleSign }) {
  const dragged = useRef(false);
  const [hoveredId, setHoveredId] = useState(null);
  const activeId = selectedId ?? hoveredId;

  // Un arrastre que termina sobre un nodo no debe abrirlo (el teclado, detail 0, siempre abre)
  const wasDragged = (event) => event?.detail !== 0 && dragged.current;
  const guardClick = (id) => (event) => {
    if (wasDragged(event)) return false;
    return id === STORE_ID ? onOpenStore() : undefined;
  };

  return (
    <section
      aria-labelledby="rizoma-titulo"
      // touch-none + overscroll-none: ni el scroll ni el rebote nativos compiten con el arrastre
      className="relative h-dvh touch-none overflow-hidden overscroll-none"
    >
      {/* Móvil: franjas que funden el mapa bajo el título y bajo los controles inferiores,
          para que las tarjetas que pasan por debajo no se mezclen con el texto */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-10 h-28 bg-linear-to-b from-bg via-bg/85 to-transparent md:hidden" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-24 bg-linear-to-t from-bg/90 to-transparent md:hidden" />

      <Heading className="pointer-events-none absolute top-5 right-20 left-5 z-10 md:top-8 md:right-auto md:left-8" />

      <InteractiveMap
        compact={compact}
        dragged={dragged}
        nodesById={graph.byId}
        edges={graph.edges}
        activeId={activeId}
        focusId={compact ? selectedId : null}
        // Escritorio: centro del lienzo, como siempre. Móvil: arranca sobre la primera meseta
        focus={compact ? FOCUS : undefined}
        hiddenSigns={hiddenSigns}
      >
        {rhizomeNodes.map((node, index) => {
          const Node = nodeComponent(node);
          return (
            <Node
              key={node.id}
              {...nodeProps({ node, index, graph, activeId, selectedId, onSelect, onNavigate, hiddenSigns })}
              onClick={guardClick(node.id)}
              onHoverChange={(hovering) =>
                setHoveredId((current) => (hovering ? node.id : current === node.id ? null : current))
              }
            />
          );
        })}
        <ObserverPortal onClick={(event) => !wasDragged(event)} />
      </InteractiveMap>

      <SemioticLegend hiddenSigns={hiddenSigns} onToggleSign={onToggleSign} />

      <p className="pointer-events-none absolute right-4 bottom-[max(1.75rem,calc(env(safe-area-inset-bottom)+0.75rem))] z-10 flex items-center gap-2 font-sans text-xs text-ink-muted md:right-8 md:bottom-8">
        <Hand className="size-4" strokeWidth={1.5} aria-hidden="true" />
        {compact ? "Desliza para explorar" : "Arrastra para explorar el territorio"}
      </p>
    </section>
  );
}
