# La Huella del Oso · Rhizomatic Territory

> *The Andean bear does not introduce itself: it lets itself be heard.*

**La Huella del Oso** ("The Bear's Footprint") is a web portfolio built as a living map rather than a catalogue. It presents audiovisual, sound, editorial and textile work about the Andean bear, the páramo and the beings that share them, and it does so through the same principle the work defends: **inter-species communication through life-centered design**.

This README explains why that principle is the backbone of the project, how it becomes the structure of the page, and which languages and technologies make it work.

---

## 1. Why inter-species communication

Most portfolios are trees: a category, then a list, then an item. A tree assumes a single point of view (the human author) that classifies everything below it. That is precisely the gaze this project tries to step away from.

The narrative of La Huella del Oso starts from a different question: **how do other beings already communicate, and how can a design make room for that?** It draws on biosemiotics, reading Charles S. Peirce through Eduardo Kohn (*How Forests Think*, 2013) and Jesper Hoffmeyer. From that perspective, meaning is not a human monopoly. A broken branch, a bird that suddenly goes silent or claw marks on bark are signs that several species can read. Communicating across species is therefore not about teaching the bear to speak or translating its growl. It is about **sharing an ecology of signs** that humans and non-humans can interpret together.

**Life-centered design** extends human-centered design to every life a project touches. In this site it shows up as concrete decisions:

- **Non-humans are actors, not subjects.** The bear, the páramo, moss and water appear as nodes with their own voice and agency, not as backdrops for human stories.
- **The human stays at the edge.** Observers and translators (rangers, the person who films) are deliberately placed on the margins of the map. They listen before they frame.
- **Signs come before labels.** A node opens with a sound or a trace to interpret, not with a title to read.
- **Silence by default.** Listening starts off. Nobody receives sound they did not ask for, just as good field recording does not invade the forest.
- **Knowledge sovereignty.** Oral memories and myths in the dataset are marked as placeholders. They must be written *with* the communities who keep them and with their explicit permission, never *about* them.

The result is a **rhizome** (Deleuze and Guattari): a network with no center and no hierarchy, where any point can connect to any other and where every connection says *how* it means, not only *that* it exists.

---

## 2. The ontology: three axes of meaning

The rhizome is defined as data in [`src/data/ontology.js`](src/data/ontology.js). Every node is a **semiotic object** described along three axes.

### Sign: how does it mean?

Peirce's three kinds of sign, each with its own color token and stroke:

| Sign | Means by | Example in the territory | Color | Root stroke |
| --- | --- | --- | --- | --- |
| **Index** (`indice`) | Contact: it exists because something happened | A branch broken by the bear | Cyan `#00f2fe` | Short dots |
| **Icon** (`icono`) | Resemblance | A film that looks at the forest from the bear's height | Violet `#7c4dff` | Dashes |
| **Symbol** (`simbolo`) | Agreement: a word, a name, a myth | A manifesto, an oral tradition | Crimson `#d81b60` | Continuous line |

The palette is not decorative. Color is the first thing the visitor reads, so it encodes the deepest layer of the ontology.

### Mode: with what matter?

`sonoro` (sound), `visual`, `audiovisual`, `tipografico` (typographic), `oral` (oral memory) and `corporal` (bodily). A single node can mix several modes.

### Layer: how deep is it read?

Each node can reveal three layers, one at a time and only when the visitor chooses to go deeper:

1. **Lo sensible** (the sensory): what is heard and seen first. Tied to the index.
2. **El relato** (the story): what the trace tells. Tied to the icon.
3. **La memoria** (memory): the knowledge and words of those who live with it. Tied to the symbol.

This descent mirrors how inter-species reading actually works: perception comes first, interpretation second, shared cultural memory last.

### Node kinds

| Kind | Role in the network |
| --- | --- |
| `actante` | A non-human being that signifies on its own (the bear) |
| `rastro` | A trace of the territory (claw marks on bark) |
| `artefacto` | A multimodal piece of work: short film, podcast, post, manifesto, sound recording, the store (default kind) |
| `saber` | Local knowledge, memories and cosmologies, without a fixed taxonomic label |
| `paisaje` | Landscape as an actor: páramo, water, fog |
| `observador` | The human who observes or translates. Always placed on the margin of the canvas |

### Typed edges: relations are verbs

Relations are not plain lines. Each one is a verb read from both ends, with a default sign:

| Type | Read from the node | Read from the other end | Default sign |
| --- | --- | --- | --- |
| `deja-rastro` | leaves a trace on | keeps the trace of | index |
| `cohabita` | lives with | lives with | index |
| `alimenta` | feeds | is fed by | index |
| `resuena` | resonates with | resonates with | icon |
| `traduce` | translates | is listened to by | icon |
| `nombra` | names | is named by | symbol |

Declaring an edge on one node is enough; the graph is built in both directions. Untyped `connections` still work as plain roots (allies use them).

---

## 3. How the narrative becomes the page

The site has a single view, the **Territorio Rizomático** ("Mundo 01"). Every interface element is a translation of the ideas above.

### The map
[`InteractiveMap`](src/components/rhizome/InteractiveMap.jsx) is a canvas larger than the screen that the visitor drags to explore, as one walks a territory instead of scrolling a list. On phones it does not collapse into a list: it becomes more compact so nodes stay within thumb reach and the territory keeps its spatial meaning. Each relation is drawn as an SVG root colored and dashed by its sign.

### Nodes and plateaus
[`PlateauNode`](src/components/rhizome/PlateauNode.jsx) renders each node as a topographic "plateau" (a reference to Deleuze and Guattari's *A Thousand Plateaus*). Its card shows the sign, the modes and an **entry index** ([`IndexCue`](src/components/rhizome/IndexCue.jsx)) instead of leading with the title. Opening it shows *Lo sensible*; buttons let the visitor descend to *El relato* and *La memoria*. The panel lists every connection with its verb ("leaves a trace on", "names") and lets the visitor jump along the rhizome; on mobile the canvas glides to the chosen node.

### Connections as interaction
- **Hover or focus** on a node lights up its roots, shows their verbs and highlights its neighbors; the rest of the network dims.
- **Toggling layers** in the legend switches off indices, icons or symbols, dimming their roots and nodes. Choosing what to perceive is itself a relation.

### Sound and visual indices
[`src/audio/soundCues.js`](src/audio/soundCues.js) synthesizes the territory's sounds in real time with the Web Audio API, without downloading any file: `ramas` (branches), `agua` (water), `viento` (wind), `canto` (birdsong that stops abruptly) and `pasos` (heavy steps). A node can point to a real recording with `entry.src` instead. Visual indices are SVG traces (`garras`, `huella`, `gota`, `frailejon`, `onda`) that draw themselves when activated, or a real photo when one is provided.

### The semiotic legend
[`SemioticLegend`](src/components/rhizome/SemioticLegend.jsx) ("Capas") explains the three signs, toggles them and turns listening on or off. On desktop it floats open in a corner; on mobile it is a 44 px pill that expands over the map.

### Allies
Workshops, trainings, gatherings and exhibitions by partner organizations are external nodes ([`ExternalBrandNode`](src/components/rhizome/ExternalBrandNode.jsx)) with a breathing organic silhouette. Their brand colors live only inside their node, their window and the roots that reach them, so they join the network without overriding its language. Clicking one does not redirect: [`ExternalNodeModal`](src/components/rhizome/ExternalNodeModal.jsx) first tells how the event connects to the inter-species narrative, then offers the external link. The allies in the data are fictional examples.

### The store
The **Mini-Tienda** is a node like any other, fed by the iconography of the films and field diaries (`alimenta` edges). [`MerchStoreDrawer`](src/components/rhizome/MerchStoreDrawer.jsx) shows a catalogue and product detail, each garment with a concept text that links it back to the territory, and builds a pre-filled WhatsApp Business order ([`src/data/storeData.js`](src/data/storeData.js)). Products, prices and the phone number are placeholders.

### The Observer
[`ObserverPortal`](src/components/rhizome/ObserverPortal.jsx) is a tiny node hidden in a corner of the map. It leads, with a fade to black, to the professional portfolio on its own subdomain (`PORTFOLIO_URL` in `portfolioData.js`). The human author enters through the margin, never through the center.

### Accessibility and care
Motion respects `prefers-reduced-motion`; drags never open nodes by accident; touch targets are at least 44 px; modals trap focus and close with Esc; a [`ThemeToggle`](src/components/layout/ThemeToggle.jsx) switches between dark and light themes and remembers the choice.

---

## 4. Languages and technologies

| Layer | Technology | Use in the project |
| --- | --- | --- |
| Language | **JavaScript (ES modules)** and **JSX** | All logic, data and components. Data files contain no JSX, only plain objects. |
| UI | **React 19** | Function components and hooks (`useMemo`, `useSyncExternalStore`, portals for drawers). |
| Build | **Vite 8** with `@vitejs/plugin-react` | Dev server, hot reload and production build. |
| Styling | **Tailwind CSS v4** via `@tailwindcss/vite` | CSS-first configuration in `src/index.css` using `@theme`, `@utility` and `@custom-variant`. No `tailwind.config.js` or PostCSS config. |
| CSS | **Modern CSS** | Design tokens as custom properties, OKLCH relative colors (`oklch(from …)`), `color-mix()`, dark mode through `data-theme`. |
| Animation | **Motion** (`motion/react`) | Draggable canvas, springs, layout and presence transitions, bottom sheets, reduced-motion support. A shared easing curve lives in `src/motion/animations.js`. |
| Sound | **Web Audio API** | Real-time synthesis of the sound indices, off until the visitor enables it. |
| Graphics | **SVG** | Roots between nodes, drawn traces, ally logos. |
| Icons | **lucide-react** | Icons for node kinds, modes and formats. |
| Markup | **HTML5** | `index.html` entry point and font loading. |
| Typography | **Google Fonts** | Carter One (display), Questrial (UI), Mulish (body). |

### Project structure

```
src/
├── App.jsx                 Root: theme toggle + map
├── main.jsx                React entry point
├── index.css               Tailwind v4 theme, tokens and utilities
├── audio/soundCues.js      Synthesized sound indices (Web Audio)
├── data/
│   ├── ontology.js         Signs, modes, layers, node kinds, relations
│   ├── portfolioData.js    Nodes of the territory and allies
│   └── storeData.js        Store catalogue and WhatsApp order link
├── hooks/                  useRhizomeGraph (typed graph), useMediaQuery
├── motion/animations.js    Shared easing
├── views/RhizomeMap.jsx    The territory view
└── components/
    ├── layout/             ThemeToggle
    ├── rhizome/            Map, nodes, legend, drawers, allies, store, portal
    └── ui/                 Reusable cards
```

To add a node, follow the template in `ONTOLOGIA.md` and add it to `rhizomeNodes` in `src/data/portfolioData.js`.

---

## 5. Getting started

Requires a recent Node.js version compatible with Vite 8.

```bash
npm install
npm run dev       # start the dev server
npm run build     # production build in dist/
npm run preview   # serve the production build locally
```

Real recordings and photos for entry indices go in `public/audio/` and `public/img/` and are referenced as `/audio/file.mp3` or `/img/file.jpg`.

---

## Note on content

All works, links, allies, products and prices are sample content to be replaced. Memories, myths and local knowledge must be written with the communities who keep them, and only with their permission.
