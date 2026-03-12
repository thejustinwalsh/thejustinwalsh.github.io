import { useEffect, useRef, useCallback } from "react";

/**
 * Interactive cellular automata hero background.
 * Randomly picks between Gray-Scott reaction-diffusion and Cyclic Automata.
 * Choice is stored in sessionStorage so it persists across navigations
 * but resets when the tab is closed.
 */

const CELL_SIZE = 12;
const GAP = 1;
const MOUSE_RADIUS = 6;

const TICK_MS: Record<Mode, number> = {
  grayscott: 33,  // ~30fps
  cyclic: 66,     // ~15fps
  noise: 33,      // ~30fps
  waves: 66,      // ~15fps
};

// Full blue → purple → pink range from Chasm palette
const PALETTE = [
  [94, 253, 247],  // #5efdf7 cyan
  [133, 218, 235], // #85daeb sky
  [95, 201, 231],  // #5fc9e7
  [69, 147, 165],  // #4593a5 steel
  [95, 161, 231],  // #5fa1e7 blue
  [95, 110, 231],  // #5f6ee7 indigo
  [76, 96, 170],   // #4c60aa slate
  [70, 60, 94],    // #463c5e plum
  [93, 71, 118],   // #5d4776 grape
  [133, 83, 149],  // #855395 orchid
  [171, 88, 168],  // #ab58a8 purple
  [202, 96, 174],  // #ca60ae rose
  [255, 93, 204],  // #ff5dcc pink
];

type Mode = "grayscott" | "cyclic" | "noise" | "waves";

const MODES: Mode[] = ["grayscott", "cyclic", "noise", "waves"];

function pickMode(): Mode {
  try {
    const stored = sessionStorage.getItem("automata-mode") as Mode | null;
    if (stored && MODES.includes(stored)) return stored;
    const mode = MODES[Math.floor(Math.random() * MODES.length)];
    sessionStorage.setItem("automata-mode", mode);
    return mode;
  } catch {
    return MODES[Math.floor(Math.random() * MODES.length)];
  }
}

// ─── Gray-Scott Reaction-Diffusion ──────────────────────
// Two chemicals U and V interact and diffuse across the grid.
// U is the substrate (starts full), V is the catalyst (seeded in spots).
// Produces perpetually splitting/merging organic patterns.
//
// dU/dt = Du·∇²U - U·V² + f·(1-U)
// dV/dt = Dv·∇²V + U·V² - (f+k)·V

const GS_DU = 0.2;    // U diffusion rate
const GS_DV = 0.1;    // V diffusion rate (slower → sharper patterns)
const GS_F = 0.055;   // feed rate (replenishes U)
const GS_K = 0.062;   // kill rate (removes V) — this combo gives mitosis (splitting spots)
const GS_DT = 0.8;    // time step — can be >1 since Gray-Scott is stable at these params
const GS_STEPS = 4;   // sub-steps per tick for faster evolution

function gsInit(u: Float32Array, v: Float32Array, cols: number, rows: number) {
  // Fill with U=1, V=0 (empty substrate)
  u.fill(1);
  v.fill(0);

  // Seed several random patches of V to kickstart reactions
  const numSeeds = 6 + Math.floor(Math.random() * 6);
  for (let s = 0; s < numSeeds; s++) {
    const cx = Math.floor(Math.random() * cols);
    const cy = Math.floor(Math.random() * rows);
    const radius = 3 + Math.floor(Math.random() * 3);
    for (let dr = -radius; dr <= radius; dr++) {
      for (let dc = -radius; dc <= radius; dc++) {
        if (dr * dr + dc * dc > radius * radius) continue;
        const r = (cy + dr + rows) % rows;
        const c = (cx + dc + cols) % cols;
        const idx = r * cols + c;
        u[idx] = 0.5 + Math.random() * 0.1;
        v[idx] = 0.25 + Math.random() * 0.1;
      }
    }
  }
}

function gsStep(
  u: Float32Array, v: Float32Array,
  nu: Float32Array, nv: Float32Array,
  cols: number, rows: number,
) {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      const uVal = u[idx];
      const vVal = v[idx];

      // 5-point Laplacian (von Neumann neighborhood)
      const top = u[((r - 1 + rows) % rows) * cols + c];
      const bot = u[((r + 1) % rows) * cols + c];
      const lft = u[r * cols + (c - 1 + cols) % cols];
      const rgt = u[r * cols + (c + 1) % cols];
      const lapU = top + bot + lft + rgt - 4 * uVal;

      const topV = v[((r - 1 + rows) % rows) * cols + c];
      const botV = v[((r + 1) % rows) * cols + c];
      const lftV = v[r * cols + (c - 1 + cols) % cols];
      const rgtV = v[r * cols + (c + 1) % cols];
      const lapV = topV + botV + lftV + rgtV - 4 * vVal;

      const uvv = uVal * vVal * vVal;

      nu[idx] = uVal + GS_DT * (GS_DU * lapU - uvv + GS_F * (1 - uVal));
      nv[idx] = vVal + GS_DT * (GS_DV * lapV + uvv - (GS_F + GS_K) * vVal);

      // Clamp
      if (nu[idx] < 0) nu[idx] = 0;
      if (nu[idx] > 1) nu[idx] = 1;
      if (nv[idx] < 0) nv[idx] = 0;
      if (nv[idx] > 1) nv[idx] = 1;
    }
  }
}

function gsMouse(
  u: Float32Array, v: Float32Array,
  cols: number, rows: number,
  mc: number, mr: number,
) {
  // Drop catalyst (V) — creates new reaction fronts that spread and split
  for (let dy = -MOUSE_RADIUS; dy <= MOUSE_RADIUS; dy++) {
    for (let dx = -MOUSE_RADIUS; dx <= MOUSE_RADIUS; dx++) {
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > MOUSE_RADIUS) continue;
      const c = (mc + dx + cols) % cols;
      const r = (mr + dy + rows) % rows;
      const idx = r * cols + c;
      const strength = 1 - dist / MOUSE_RADIUS;
      v[idx] = Math.min(1, v[idx] + strength * 0.3);
      u[idx] = Math.max(0, u[idx] - strength * 0.15);
    }
  }
}

function gsColor(uVal: number, vVal: number): [number, number, number, number] {
  // V concentration drives color — maps through palette
  // Low V = transparent, high V = vivid
  if (vVal < 0.01) return [0, 0, 0, 0];

  const t = Math.min(vVal * 3, 1); // amplify V for palette mapping
  const pi = t * (PALETTE.length - 1);
  const lo = Math.floor(pi);
  const hi = Math.min(lo + 1, PALETTE.length - 1);
  const f = pi - lo;
  return [
    PALETTE[lo][0] + (PALETTE[hi][0] - PALETTE[lo][0]) * f,
    PALETTE[lo][1] + (PALETTE[hi][1] - PALETTE[lo][1]) * f,
    PALETTE[lo][2] + (PALETTE[hi][2] - PALETTE[lo][2]) * f,
    Math.min(vVal * 1.5, 0.35),
  ];
}

// ─── Cyclic Automata ─────────────────────────────────────
// N states in a cycle. Each consumed by its successor.
// Creates expanding spiral waves that never die out.

const CYCLIC_NUM_STATES = PALETTE.length;
const CYCLIC_THRESHOLD = 1;

function cyclicInit(grid: Uint8Array) {
  for (let i = 0; i < grid.length; i++) {
    grid[i] = Math.floor(Math.random() * CYCLIC_NUM_STATES);
  }
}

function cyclicStep(
  grid: Uint8Array,
  next: Uint8Array,
  cols: number,
  rows: number,
) {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      const current = grid[idx];
      const successor = (current + 1) % CYCLIC_NUM_STATES;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = (r + dr + rows) % rows;
          const nc = (c + dc + cols) % cols;
          if (grid[nr * cols + nc] === successor) count++;
        }
      }
      next[idx] = count >= CYCLIC_THRESHOLD ? successor : current;
    }
  }
}

function cyclicMouse(
  grid: Uint8Array,
  cols: number,
  rows: number,
  mc: number,
  mr: number,
) {
  for (let dy = -MOUSE_RADIUS; dy <= MOUSE_RADIUS; dy++) {
    for (let dx = -MOUSE_RADIUS; dx <= MOUSE_RADIUS; dx++) {
      if (dx * dx + dy * dy > MOUSE_RADIUS * MOUSE_RADIUS) continue;
      const c = (mc + dx + cols) % cols;
      const r = (mr + dy + rows) % rows;
      // Scramble — randomize state for chaotic disruption
      if (Math.random() < 0.5) {
        grid[r * cols + c] = Math.floor(Math.random() * CYCLIC_NUM_STATES);
      }
    }
  }
}

function cyclicColor(state: number): [number, number, number, number] {
  const p = PALETTE[state % PALETTE.length];
  return [p[0], p[1], p[2], 0.22];
}

// ─── Simplex Noise (compact 2D implementation) ──────────
// Based on Stefan Gustavson's simplex noise. Just enough for 2D.

const F2 = 0.5 * (Math.sqrt(3) - 1);
const G2 = (3 - Math.sqrt(3)) / 6;
const GRAD2 = [[1,1],[-1,1],[1,-1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]];

// Permutation table — randomized once
const PERM = new Uint8Array(512);
{
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = p[i]; p[i] = p[j]; p[j] = tmp;
  }
  for (let i = 0; i < 512; i++) PERM[i] = p[i & 255];
}

function simplex2(x: number, y: number): number {
  const s = (x + y) * F2;
  const i = Math.floor(x + s);
  const j = Math.floor(y + s);
  const t = (i + j) * G2;
  const x0 = x - (i - t);
  const y0 = y - (j - t);
  const i1 = x0 > y0 ? 1 : 0;
  const j1 = x0 > y0 ? 0 : 1;
  const x1 = x0 - i1 + G2;
  const y1 = y0 - j1 + G2;
  const x2 = x0 - 1 + 2 * G2;
  const y2 = y0 - 1 + 2 * G2;
  const ii = i & 255, jj = j & 255;

  let n0 = 0, n1 = 0, n2 = 0;
  let t0 = 0.5 - x0 * x0 - y0 * y0;
  if (t0 > 0) { t0 *= t0; const g = GRAD2[PERM[ii + PERM[jj]] & 7]; n0 = t0 * t0 * (g[0] * x0 + g[1] * y0); }
  let t1 = 0.5 - x1 * x1 - y1 * y1;
  if (t1 > 0) { t1 *= t1; const g = GRAD2[PERM[ii + i1 + PERM[jj + j1]] & 7]; n1 = t1 * t1 * (g[0] * x1 + g[1] * y1); }
  let t2 = 0.5 - x2 * x2 - y2 * y2;
  if (t2 > 0) { t2 *= t2; const g = GRAD2[PERM[ii + 1 + PERM[jj + 1]] & 7]; n2 = t2 * t2 * (g[0] * x2 + g[1] * y2); }

  return 70 * (n0 + n1 + n2); // range ~[-1, 1]
}

// ─── Noise Flow ──────────────────────────────────────────
// Animated simplex noise drifting through the palette.
// O(cells) per frame, no neighbor lookups, no state buffers.
// Always organic, always moving.

interface NoiseState {
  time: number;
  scale: number;    // spatial frequency
  speed: number;    // time advancement per tick
  mouseX: number;   // mouse distortion center
  mouseY: number;
  mouseStrength: number; // decays over time
}

function noiseInit(): NoiseState {
  return {
    time: Math.random() * 1000,
    scale: 0.06 + Math.random() * 0.03,
    speed: 0.015,
    mouseX: 0, mouseY: 0, mouseStrength: 0,
  };
}

function noiseStep(ns: NoiseState) {
  ns.time += ns.speed;
  // Decay mouse influence
  ns.mouseStrength *= 0.92;
}

function noiseMouse(ns: NoiseState, mc: number, mr: number) {
  ns.mouseX = mc;
  ns.mouseY = mr;
  ns.mouseStrength = Math.min(ns.mouseStrength + 0.15, 1.0);
}

function noiseColor(
  c: number, r: number, ns: NoiseState,
): [number, number, number, number] {
  // Layer two octaves for richer texture
  const sc = ns.scale;
  let val = simplex2(c * sc, r * sc + ns.time) * 0.6
          + simplex2(c * sc * 2.3 + 100, r * sc * 2.3 + ns.time * 1.3) * 0.4;

  // Mouse gently displaces the noise sample coordinates
  if (ns.mouseStrength > 0.01) {
    const dx = c - ns.mouseX;
    const dy = r - ns.mouseY;
    const distSq = dx * dx + dy * dy;
    const radius = 18;
    if (distSq < radius * radius) {
      const dist = Math.sqrt(distSq);
      const falloff = (1 - dist / radius);
      // Offset the sample point — creates a gentle swirl, not a value spike
      const offset = ns.mouseStrength * falloff * 0.8;
      val = simplex2(c * sc + offset, r * sc - offset + ns.time) * 0.6
          + simplex2(c * sc * 2.3 + 100 + offset * 0.5, r * sc * 2.3 + ns.time * 1.3) * 0.4;
    }
  }

  // Map [-1, 1] → [0, 1]
  const t = val * 0.5 + 0.5;
  const pi = t * (PALETTE.length - 1);
  const lo = Math.floor(pi);
  const hi = Math.min(lo + 1, PALETTE.length - 1);
  const f = pi - lo;
  return [
    PALETTE[lo][0] + (PALETTE[hi][0] - PALETTE[lo][0]) * f,
    PALETTE[lo][1] + (PALETTE[hi][1] - PALETTE[lo][1]) * f,
    PALETTE[lo][2] + (PALETTE[hi][2] - PALETTE[lo][2]) * f,
    0.18 + Math.abs(val) * 0.1,
  ];
}

// ─── Wave Interference ──────────────────────────────────
// Concentric ring waves from random source points.
// Sources spawn, live, and fade. Amplitudes sum and interfere.
// O(cells × sources) per frame — cheap with ~6-10 sources.

interface WaveSource {
  x: number;
  y: number;
  birth: number;   // time of creation
  freq: number;    // wave frequency
  speed: number;   // expansion speed
  life: number;    // max lifetime in ticks
  age: number;
}

interface WaveState {
  sources: WaveSource[];
  time: number;
  mouseX: number;
  mouseY: number;
  mouseSource: WaveSource | null;
}

function waveInit(): WaveState {
  return { sources: [], time: 0, mouseX: 0, mouseY: 0, mouseSource: null };
}

function waveSpawn(ws: WaveState, cols: number, rows: number) {
  ws.sources.push({
    x: Math.random() * cols,
    y: Math.random() * rows,
    birth: ws.time,
    freq: 0.3 + Math.random() * 0.3,
    speed: 0.3 + Math.random() * 0.2,
    life: 80 + Math.floor(Math.random() * 120),
    age: 0,
  });
}

function waveStep(ws: WaveState, cols: number, rows: number) {
  ws.time++;

  // Age and remove dead sources
  for (const src of ws.sources) src.age++;
  ws.sources = ws.sources.filter(s => s.age < s.life);

  // Maintain 6-10 sources
  if (ws.sources.length < 3 || (ws.sources.length < 6 && Math.random() < 0.02)) {
    waveSpawn(ws, cols, rows);
  }
}

function waveMouse(ws: WaveState, mc: number, mr: number) {
  // Continuously emit from cursor position
  if (!ws.mouseSource || ws.mouseSource.age > 20) {
    ws.mouseSource = {
      x: mc, y: mr,
      birth: ws.time,
      freq: 0.4,
      speed: 0.4,
      life: 60,
      age: 0,
    };
    ws.sources.push(ws.mouseSource);
  } else {
    ws.mouseSource.x = mc;
    ws.mouseSource.y = mr;
  }
}

function waveColor(
  c: number, r: number, ws: WaveState,
): [number, number, number, number] {
  let amplitude = 0;
  for (const src of ws.sources) {
    const dx = c - src.x;
    const dy = r - src.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const wave = Math.sin(dist * src.freq - src.age * src.speed);
    // Fade in and out over lifetime
    const envelope = Math.min(src.age / 8, 1) * Math.max(0, 1 - src.age / src.life);
    // Attenuate with distance
    const atten = 1 / (1 + dist * 0.04);
    amplitude += wave * envelope * atten;
  }

  if (Math.abs(amplitude) < 0.05) return [0, 0, 0, 0];

  // Map amplitude to palette — positive and negative both produce color
  const t = Math.abs(amplitude);
  const palT = Math.min(t, 1);
  const pi = palT * (PALETTE.length - 1);
  const lo = Math.floor(pi);
  const hi = Math.min(lo + 1, PALETTE.length - 1);
  const f = pi - lo;
  return [
    PALETTE[lo][0] + (PALETTE[hi][0] - PALETTE[lo][0]) * f,
    PALETTE[lo][1] + (PALETTE[hi][1] - PALETTE[lo][1]) * f,
    PALETTE[lo][2] + (PALETTE[hi][2] - PALETTE[lo][2]) * f,
    Math.min(t * 0.25, 0.3),
  ];
}

// ─── Component ───────────────────────────────────────────

interface Props {
  className?: string;
}

export default function Automata({ className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<{
    // Gray-Scott
    gsU: Float32Array | null;
    gsV: Float32Array | null;
    gsNU: Float32Array | null;
    gsNV: Float32Array | null;
    // Cyclic
    gridU: Uint8Array | null;
    nextU: Uint8Array | null;
    // Noise flow
    noise: NoiseState | null;
    // Wave interference
    waves: WaveState | null;
    cols: number;
    rows: number;
    mouseCol: number;
    mouseRow: number;
    mouseActive: boolean;
    mode: Mode;
  } | null>(null);

  const init = useCallback((canvas: HTMLCanvasElement, forceMode?: Mode) => {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const cols = Math.ceil(rect.width / (CELL_SIZE + GAP));
    const rows = Math.ceil(rect.height / (CELL_SIZE + GAP));
    const size = cols * rows;

    const mode: Mode = forceMode ?? stateRef.current?.mode ?? pickMode();

    let gsU: Float32Array | null = null;
    let gsV: Float32Array | null = null;
    let gsNU: Float32Array | null = null;
    let gsNV: Float32Array | null = null;
    let gridU: Uint8Array | null = null;
    let nextU: Uint8Array | null = null;
    let noise: NoiseState | null = null;
    let waves: WaveState | null = null;

    if (mode === "grayscott") {
      gsU = new Float32Array(size);
      gsV = new Float32Array(size);
      gsNU = new Float32Array(size);
      gsNV = new Float32Array(size);
      gsInit(gsU, gsV, cols, rows);
    } else if (mode === "cyclic") {
      gridU = new Uint8Array(size);
      nextU = new Uint8Array(size);
      cyclicInit(gridU);
    } else if (mode === "noise") {
      noise = noiseInit();
    } else if (mode === "waves") {
      waves = waveInit();
    }

    stateRef.current = {
      gsU, gsV, gsNU, gsNV,
      gridU, nextU,
      noise, waves,
      cols, rows,
      mouseCol: -1, mouseRow: -1, mouseActive: false,
      mode,
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    init(canvas);

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // ── Input (global listeners — canvas is behind other elements) ──

    const updateMouse = (clientX: number, clientY: number) => {
      const state = stateRef.current;
      if (!state) return;
      const rect = canvas.getBoundingClientRect();
      const col = Math.floor((clientX - rect.left) / (CELL_SIZE + GAP));
      const row = Math.floor((clientY - rect.top) / (CELL_SIZE + GAP));
      // Active only when cursor is within canvas bounds
      if (col >= 0 && col < state.cols && row >= 0 && row < state.rows) {
        state.mouseCol = col;
        state.mouseRow = row;
        state.mouseActive = true;
      } else {
        state.mouseActive = false;
      }
    };

    const handleMouse = (e: MouseEvent) => updateMouse(e.clientX, e.clientY);

    const handleTouch = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch) updateMouse(touch.clientX, touch.clientY);
    };

    const handleTouchEnd = () => {
      if (stateRef.current) stateRef.current.mouseActive = false;
    };

    window.addEventListener("mousemove", handleMouse);
    window.addEventListener("touchmove", handleTouch, { passive: true });
    window.addEventListener("touchend", handleTouchEnd);

    // ── Loop ──

    let lastTick = 0;
    let raf: number;

    const step = () => {
      const s = stateRef.current;
      if (!s) return;
      const { cols, rows, mouseCol, mouseRow, mouseActive, mode } = s;

      if (mode === "grayscott" && s.gsU && s.gsV && s.gsNU && s.gsNV) {
        const u = s.gsU, v = s.gsV, nu = s.gsNU, nv = s.gsNV;
        if (mouseActive) gsMouse(u, v, cols, rows, mouseCol, mouseRow);
        let cu = u, cv = v, cnu = nu, cnv = nv;
        for (let i = 0; i < GS_STEPS; i++) {
          gsStep(cu, cv, cnu, cnv, cols, rows);
          const tu = cu; cu = cnu; cnu = tu;
          const tv = cv; cv = cnv; cnv = tv;
        }
        s.gsU = cu; s.gsV = cv; s.gsNU = cnu; s.gsNV = cnv;
      } else if (mode === "cyclic" && s.gridU && s.nextU) {
        if (mouseActive) cyclicMouse(s.gridU, cols, rows, mouseCol, mouseRow);
        cyclicStep(s.gridU, s.nextU, cols, rows);
        const tmp = s.gridU;
        s.gridU = s.nextU;
        s.nextU = tmp;
      } else if (mode === "noise" && s.noise) {
        if (mouseActive) noiseMouse(s.noise, mouseCol, mouseRow);
        noiseStep(s.noise);
      } else if (mode === "waves" && s.waves) {
        if (mouseActive) waveMouse(s.waves, mouseCol, mouseRow);
        waveStep(s.waves, cols, rows);
      }
    };

    const draw = () => {
      const s = stateRef.current;
      if (!s) return;
      const { cols, rows, mode } = s;
      const dpr = canvas.width / (canvas.offsetWidth || 1);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cellStep = (CELL_SIZE + GAP) * dpr;
      const cellSize = CELL_SIZE * dpr;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          let red: number, grn: number, blu: number, alpha: number;

          if (mode === "grayscott" && s.gsU && s.gsV) {
            const idx = r * cols + c;
            const vVal = s.gsV[idx];
            if (vVal < 0.01) continue;
            [red, grn, blu, alpha] = gsColor(s.gsU[idx], vVal);
          } else if (mode === "cyclic" && s.gridU) {
            [red, grn, blu, alpha] = cyclicColor(s.gridU[r * cols + c]);
          } else if (mode === "noise" && s.noise) {
            [red, grn, blu, alpha] = noiseColor(c, r, s.noise);
          } else if (mode === "waves" && s.waves) {
            [red, grn, blu, alpha] = waveColor(c, r, s.waves);
            if (alpha < 0.01) continue;
          } else {
            continue;
          }

          ctx.fillStyle = `rgba(${red | 0},${grn | 0},${blu | 0},${alpha})`;
          ctx.fillRect(c * cellStep, r * cellStep, cellSize, cellSize);
        }
      }
    };

    // Reset timing when tab regains visibility to prevent catch-up burst
    const handleVisibility = () => {
      if (!document.hidden) lastTick = 0;
    };
    document.addEventListener("visibilitychange", handleVisibility);

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);

      if (prefersReducedMotion) {
        draw();
        cancelAnimationFrame(raf);
        return;
      }

      // First frame or returning from background — anchor to now
      if (lastTick === 0) {
        lastTick = now;
        draw();
        return;
      }

      const tickMs = TICK_MS[stateRef.current?.mode ?? "grayscott"];
      if (now - lastTick >= tickMs) {
        const behind = now - lastTick;
        const steps = Math.min(Math.floor(behind / tickMs), 3);
        for (let i = 0; i < steps; i++) step();
        lastTick += steps * tickMs;
      }

      draw();
    };

    if (prefersReducedMotion) {
      // Pre-sim to a developed state for the static snapshot
      const s = stateRef.current;
      const preSimMap: Record<Mode, number> = {
        grayscott: 600, cyclic: 60, noise: 1, waves: 40,
      };
      const preSim = preSimMap[s?.mode ?? "cyclic"];
      for (let i = 0; i < preSim; i++) step();
      draw();
    } else {
      raf = requestAnimationFrame(loop);
    }

    const resizeObserver = new ResizeObserver(() => init(canvas));
    resizeObserver.observe(canvas);

    // Dev-only: number keys 1-4 to switch modes
    const handleKeyDown = import.meta.env.DEV
      ? (e: KeyboardEvent) => {
          const keyMap: Record<string, Mode> = {
            "1": "grayscott",
            "2": "cyclic",
            "3": "noise",
            "4": "waves",
          };
          const mode = keyMap[e.key];
          if (mode) {
            init(canvas, mode);
            lastTick = 0;
          }
        }
      : null;
    if (handleKeyDown) window.addEventListener("keydown", handleKeyDown);

    return () => {
      cancelAnimationFrame(raf);
      if (handleKeyDown) window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("mousemove", handleMouse);
      window.removeEventListener("touchmove", handleTouch);
      window.removeEventListener("touchend", handleTouchEnd);
      resizeObserver.disconnect();
    };
  }, [init]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}
