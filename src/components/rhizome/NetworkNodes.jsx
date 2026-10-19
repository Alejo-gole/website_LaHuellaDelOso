import { useEffect, useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";

/* ============================================================
   NetworkNodes · Red de flujo energético vital
   Lienzo Canvas 2D con nodos de bioquímica bioluminiscentes que
   flotan, se enlazan por proximidad y se apartan del cursor.
   Autosuficiente: solo depende de React y Motion.
   ============================================================ */

// Token del tema en src/index.css; el hex es el respaldo si la variable no existe
const THEME_TOKEN = "--color-oso-teal";
const FALLBACK_COLOR = "#339183";

// Normaliza cualquier color CSS (hex, rgb, var del tema) a "r g b" para componer rgb(... / alpha)
function resolveRgb(color) {
  const value =
    color ?? (getComputedStyle(document.documentElement).getPropertyValue(THEME_TOKEN).trim() || FALLBACK_COLOR);
  const probe = document.createElement("canvas").getContext("2d");
  probe.fillStyle = FALLBACK_COLOR;
  probe.fillStyle = value; // un valor inválido se ignora y queda el respaldo
  const parsed = probe.fillStyle;
  if (parsed.startsWith("#")) {
    const n = parseInt(parsed.slice(1), 16);
    return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
  }
  const [r, g, b] = parsed.match(/[\d.]+/g) ?? [51, 145, 131];
  return `${r} ${g} ${b}`;
}

// Halo pre-renderizado: dibujar un sprite es mucho más barato que shadowBlur por nodo
function createGlowSprite(rgb, size) {
  const sprite = document.createElement("canvas");
  sprite.width = sprite.height = size;
  const ctx = sprite.getContext("2d");
  const r = size / 2;
  const g = ctx.createRadialGradient(r, r, 0, r, r, r);
  g.addColorStop(0, `rgb(${rgb} / 0.9)`);
  g.addColorStop(0.2, `rgb(${rgb} / 0.45)`);
  g.addColorStop(0.5, `rgb(${rgb} / 0.12)`);
  g.addColorStop(1, `rgb(${rgb} / 0)`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return sprite;
}

function createNodes(count, width, height) {
  return Array.from({ length: count }, () => {
    const x = Math.random() * width;
    const y = Math.random() * height;
    return {
      x,
      y,
      homeX: x, // punto de anclaje: el nodo deriva a su alrededor
      homeY: y,
      vx: 0,
      vy: 0,
      radius: 1.2 + Math.random() * 2.2,
      phase: Math.random() * Math.PI * 2, // desfase de flotación y pulso
      drift: 10 + Math.random() * 22, // amplitud de la flotación en px
      speed: 0.00012 + Math.random() * 0.00018, // ritmo lento, de respiración
    };
  });
}

export default function NetworkNodes({
  color, // por defecto: el teal del tema (--color-oso-teal)
  density = 1, // multiplicador sobre la cantidad base calculada por área
  maxNodes = 110,
  linkDistance = 140,
  cursorRadius = 160,
  cursorForce = 0.6,
  className = "",
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const reduceMotion = useReducedMotion();

  // Cursor suavizado con springs de Motion: la red responde con inercia orgánica
  const pointerX = useMotionValue(-9999);
  const pointerY = useMotionValue(-9999);
  const smoothX = useSpring(pointerX, { stiffness: 60, damping: 18, mass: 0.6 });
  const smoothY = useSpring(pointerY, { stiffness: 60, damping: 18, mass: 0.6 });

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext("2d");
    const rgb = resolveRgb(color);
    const glow = createGlowSprite(rgb, 64);
    const linkDistSq = linkDistance * linkDistance;

    let width = 0;
    let height = 0;
    let nodes = [];
    let frameId = 0;
    let visible = true;
    let pointerActive = false;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(maxNodes, Math.round(((width * height) / 14000) * density));
      nodes = createNodes(Math.max(count, 12), width, height);
      if (reduceMotion) draw(0);
    };

    const step = (time) => {
      const mx = smoothX.get();
      const my = smoothY.get();
      const cursorRadiusSq = cursorRadius * cursorRadius;

      for (const n of nodes) {
        // Flotación: deriva sinusoidal lenta alrededor del anclaje
        const t = time * n.speed + n.phase;
        const targetX = n.homeX + Math.cos(t) * n.drift + Math.sin(t * 0.7) * n.drift * 0.4;
        const targetY = n.homeY + Math.sin(t * 1.1) * n.drift;

        // Resorte suave de vuelta a la trayectoria
        n.vx += (targetX - n.x) * 0.012;
        n.vy += (targetY - n.y) * 0.012;

        // Cursor: repulsión sutil, decrece con la distancia
        if (pointerActive) {
          const dx = n.x - mx;
          const dy = n.y - my;
          const dSq = dx * dx + dy * dy;
          if (dSq < cursorRadiusSq && dSq > 0.01) {
            const d = Math.sqrt(dSq);
            const f = (1 - d / cursorRadius) ** 2 * cursorForce;
            n.vx += (dx / d) * f;
            n.vy += (dy / d) * f;
          }
        }

        n.vx *= 0.9;
        n.vy *= 0.9;
        n.x += n.vx;
        n.y += n.vy;
      }
    };

    const draw = (time) => {
      ctx.clearRect(0, 0, width, height);
      const mx = smoothX.get();
      const my = smoothY.get();

      // Líneas finas: opacidad según cercanía, más intensas junto al cursor
      ctx.lineWidth = 0.6;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dSq = dx * dx + dy * dy;
          if (dSq > linkDistSq) continue;

          let alpha = (1 - Math.sqrt(dSq) / linkDistance) * 0.45;
          if (pointerActive) {
            const cx = (a.x + b.x) / 2 - mx;
            const cy = (a.y + b.y) / 2 - my;
            const near = 1 - Math.min(1, Math.sqrt(cx * cx + cy * cy) / (cursorRadius * 1.4));
            alpha *= 1 + near * 1.2;
          }
          ctx.strokeStyle = `rgb(${rgb} / ${Math.min(alpha, 0.85).toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      // Nodos: halo aditivo + núcleo con pulso respiratorio
      ctx.globalCompositeOperation = "lighter";
      for (const n of nodes) {
        const pulse = reduceMotion ? 1 : 0.8 + Math.sin(time * 0.0012 + n.phase) * 0.2;
        const haloSize = n.radius * 9 * pulse;
        ctx.globalAlpha = 0.55 * pulse;
        ctx.drawImage(glow, n.x - haloSize / 2, n.y - haloSize / 2, haloSize, haloSize);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";

      ctx.fillStyle = `rgb(${rgb} / 0.95)`;
      for (const n of nodes) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const loop = (time) => {
      step(time);
      draw(time);
      frameId = requestAnimationFrame(loop);
    };

    const start = () => {
      if (reduceMotion || frameId || !visible || document.hidden) return;
      frameId = requestAnimationFrame(loop);
    };
    const stop = () => {
      cancelAnimationFrame(frameId);
      frameId = 0;
    };

    // El cursor se escucha en window para que funcione aunque el lienzo esté
    // detrás del contenido con pointer-events: none
    const onPointerMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;
      if (inside && !pointerActive) {
        // Al entrar, el spring parte desde el cursor para evitar un barrido desde fuera
        smoothX.jump(x);
        smoothY.jump(y);
      }
      pointerActive = inside;
      pointerX.set(x);
      pointerY.set(y);
    };
    const onPointerLeave = () => {
      pointerActive = false;
    };
    const onVisibility = () => (document.hidden ? stop() : start());

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    // Pausa la simulación cuando la sección sale de pantalla
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      visible ? start() : stop();
    });
    intersectionObserver.observe(container);

    resize();
    if (!reduceMotion) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onPointerLeave);
      document.addEventListener("visibilitychange", onVisibility);
      start();
    }

    return () => {
      stop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [color, density, maxNodes, linkDistance, cursorRadius, cursorForce, reduceMotion, pointerX, pointerY, smoothX, smoothY]);

  return (
    <motion.div
      ref={containerRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reduceMotion ? 0 : 2.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <canvas ref={canvasRef} className="block size-full" />
    </motion.div>
  );
}
