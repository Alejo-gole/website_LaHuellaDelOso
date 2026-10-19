import ThemeToggle from "./components/layout/ThemeToggle.jsx";
import RhizomeMap from "./views/RhizomeMap.jsx";

/* ============================================================
   App · La Huella del Oso — Territorio Rizomático
   Sitio del dominio principal: solo el mapa. El portafolio
   profesional vive en su propio subdominio y se alcanza por el
   portal oculto «El Observador» (components/rhizome/ObserverPortal).
   La composición anterior (hero, grid, consola) vive en App.previous.jsx
   ============================================================ */

export default function App() {
  return (
    <div data-overlay-root className="relative isolate min-h-dvh bg-bg text-ink transition-colors duration-500">
      <ThemeToggle />
      <main className="min-h-dvh">
        <RhizomeMap />
      </main>
    </div>
  );
}
