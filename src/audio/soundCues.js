import { useSyncExternalStore } from "react";

/* ============================================================
   soundCues · Índices sonoros del territorio (Web Audio)
   Cada nodo puede entrar por un sonido (entry.cue). Si el nodo
   trae entry.src se reproduce ese archivo; si no, el sonido se
   sintetiza aquí, sin descargar nada:
     ramas · agua · viento · canto · pasos
   La escucha empieza apagada: el navegador solo permite sonar
   tras un gesto del usuario, y nadie debe recibir sonido sin
   pedirlo. setListening(true) la activa (desde la leyenda).
   ============================================================ */

let ctx = null;
let master = null;
let listening = false;
const subscribers = new Set();

function audio() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctx = window.AudioContext ?? window.webkitAudioContext;
    if (!Ctx) return null;
    ctx = new Ctx();
    master = ctx.createGain();
    master.gain.value = 0.35;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

// Ruido blanco reutilizable (2 s)
let noiseBuffer = null;
function noise(ac) {
  if (!noiseBuffer) {
    noiseBuffer = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  const src = ac.createBufferSource();
  src.buffer = noiseBuffer;
  return src;
}

// Envolvente rápida: sube en `attack` y cae exponencialmente en `decay`
function envelope(ac, at, peak, attack, decay) {
  const g = ac.createGain();
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(peak, at + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, at + attack + decay);
  return g;
}

function burst(ac, at, { type, freq, q = 1, peak, attack = 0.002, decay }) {
  const src = noise(ac);
  const filter = ac.createBiquadFilter();
  filter.type = type;
  filter.frequency.value = freq;
  filter.Q.value = q;
  const g = envelope(ac, at, peak, attack, decay);
  src.connect(filter).connect(g).connect(master);
  src.start(at, Math.random() * 1.5, attack + decay + 0.05);
}

function tone(ac, at, { from, to, duration, peak, type = "sine" }) {
  const osc = ac.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(from, at);
  osc.frequency.exponentialRampToValueAtTime(to, at + duration);
  const g = envelope(ac, at, peak, 0.01, duration);
  osc.connect(g).connect(master);
  osc.start(at);
  osc.stop(at + duration + 0.05);
}

const rand = (min, max) => min + Math.random() * (max - min);

const CUES = {
  // Crujidos secos y desordenados en lo alto
  ramas(ac, t) {
    let at = t;
    for (let i = 0; i < 7; i++) {
      at += rand(0.04, 0.22);
      burst(ac, at, { type: "highpass", freq: rand(1200, 3000), peak: rand(0.4, 0.9), decay: rand(0.02, 0.07) });
      if (i % 3 === 0) burst(ac, at, { type: "bandpass", freq: 320, q: 2, peak: 0.5, decay: 0.12 });
    }
  },
  // Gotas: tonos que suben rápido sobre un murmullo grave
  agua(ac, t) {
    burst(ac, t, { type: "lowpass", freq: 500, peak: 0.12, attack: 0.4, decay: 1.6 });
    for (let i = 0; i < 6; i++) {
      const f = rand(500, 900);
      tone(ac, t + rand(0.05, 1.6), { from: f, to: f * rand(1.8, 2.6), duration: rand(0.05, 0.09), peak: 0.25 });
    }
  },
  // Ráfaga que crece y se aleja
  viento(ac, t) {
    const src = noise(ac);
    const filter = ac.createBiquadFilter();
    filter.type = "bandpass";
    filter.Q.value = 0.8;
    filter.frequency.setValueAtTime(260, t);
    filter.frequency.exponentialRampToValueAtTime(900, t + 1.1);
    filter.frequency.exponentialRampToValueAtTime(300, t + 2.4);
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.7, t + 1);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 2.4);
    src.connect(filter).connect(g).connect(master);
    src.start(t, 0, 2.5);
  },
  // Un pájaro canta… y se calla de golpe
  canto(ac, t) {
    for (let i = 0; i < 5; i++) {
      const at = t + i * 0.16;
      tone(ac, at, { from: 2600, to: 4100, duration: 0.07, peak: 0.18 });
      tone(ac, at + 0.07, { from: 3900, to: 3000, duration: 0.05, peak: 0.12 });
    }
  },
  // Pisadas pesadas y lentas
  pasos(ac, t) {
    for (let i = 0; i < 3; i++) {
      burst(ac, t + i * 0.45, { type: "lowpass", freq: 180, peak: 0.9, attack: 0.01, decay: 0.16 });
    }
  },
};

const files = new Map();

/** Reproduce el índice sonoro de un nodo. Devuelve false si no pudo sonar. */
export function playCue({ cue, src } = {}) {
  if (src) {
    const el = files.get(src) ?? new Audio(src);
    files.set(src, el);
    el.currentTime = 0;
    el.play().catch(() => {});
    return true;
  }
  const ac = audio();
  if (!ac || !CUES[cue]) return false;
  CUES[cue](ac, ac.currentTime + 0.02);
  return true;
}

export function setListening(value) {
  listening = value;
  if (value) audio(); // se llama desde un clic: desbloquea el AudioContext
  subscribers.forEach((notify) => notify());
}

export const isListening = () => listening;

/** Estado de la escucha para React. */
export function useListening() {
  return useSyncExternalStore(
    (notify) => {
      subscribers.add(notify);
      return () => subscribers.delete(notify);
    },
    () => listening,
    () => false
  );
}
