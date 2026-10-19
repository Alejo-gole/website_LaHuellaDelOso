import { useMemo } from "react";
import { RELATIONS } from "../data/ontology.js";

/* ============================================================
   useRhizomeGraph · Lee `connections` de los nodos y devuelve:
   - edges      Raíces sin duplicar: [[idA, idB], …]
   - neighbors  Vecinos de cada nodo en ambos sentidos
   - links      Por nodo, sus aristas leídas desde él:
                [{ id, type, sign, verb, note }] (los paneles las listan)
   - byId       Acceso directo a cada nodo
   Una conexión basta con declararla en uno de los dos nodos;
   los ids que no existen se ignoran.
   ============================================================ */

export default function useRhizomeGraph(nodes) {
  return useMemo(() => {
    const byId = Object.fromEntries(nodes.map((node) => [node.id, node]));
    const seen = new Set();
    const edges = [];
    const neighbors = Object.fromEntries(nodes.map((node) => [node.id, new Set()]));
    const links = Object.fromEntries(nodes.map((node) => [node.id, []]));

    // Cada arista se lee desde sus dos extremos: «deja rastro en» / «guarda el rastro de»
    const link = (from, to, meta) => {
      const relation = RELATIONS[meta.type] ?? RELATIONS.raiz ?? {};
      links[from].push({ id: to, ...meta, verb: relation.label });
      links[to].push({ id: from, ...meta, verb: relation.back });
    };

    for (const node of nodes) {
      // Typed edges declared in `relations`
      for (const rel of node.relations ?? []) {
        const target = rel.to;
        if (!byId[target] || target === node.id) continue;
        const key = [node.id, target].sort().join("|");
        if (seen.has(key)) continue;
        seen.add(key);
        const meta = { type: rel.type ?? "raiz", sign: rel.sign ?? RELATIONS[rel.type]?.sign ?? null, note: rel.note };
        edges.push([node.id, target, meta]);
        link(node.id, target, meta);
        neighbors[node.id].add(target);
        neighbors[target].add(node.id);
      }
      // Untyped edges declared in `connections` (legacy / allies)
      for (const target of node.connections ?? []) {
        if (!byId[target] || target === node.id) continue;
        const key = [node.id, target].sort().join("|");
        if (seen.has(key)) continue;
        seen.add(key);
        const meta = { type: "raiz", sign: null };
        edges.push([node.id, target, meta]);
        link(node.id, target, meta);
        neighbors[node.id].add(target);
        neighbors[target].add(node.id);
      }
    }

    return { edges, neighbors, links, byId };
  }, [nodes]);
}
