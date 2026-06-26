"use client";

import { useRef, useEffect, useCallback } from "react";

/**
 * RecoveryTree — a generative tree that grows branch by branch on a transparent
 * canvas, themed in ReHub teal, with gently falling leaves drifting over it.
 * Growth is the brand metaphor: recovery, branching paths, taking root again.
 * Sized to its parent container, retina-crisp, reduced-motion safe.
 */

interface Vec {
  x: number;
  y: number;
}
interface Branch {
  position: Vec;
  stw: number;
  gen: number;
  alive: boolean;
  age: number;
  angle: number;
  speed: Vec;
  maxlife: number;
  deviation: number;
}
interface Tree {
  branches: Branch[];
  start: Vec;
  teinte: number;
}
interface Leaf {
  x: number;
  y: number;
  vy: number;
  size: number;
  swayAmp: number;
  swaySpeed: number;
  phase: number;
  angle: number;
  spin: number;
  hue: number;
  alpha: number;
}

const MAXLIFE = 26; // longer life → taller, fuller tree
const LEAF_COUNT = 26;

const rand = (min?: number, max?: number) => {
  if (min === undefined) return Math.random();
  if (max === undefined) return Math.random() * min;
  return min + Math.random() * (max - min);
};

function hsbToRgb(h: number, s: number, b: number, a = 1): string {
  h = (((h % 360) + 360) % 360) / 360;
  s = Math.max(0, Math.min(255, s)) / 255;
  b = Math.max(0, Math.min(255, b)) / 255;
  const c = b * s;
  const x = c * (1 - Math.abs(((h * 6) % 2) - 1));
  const m = b - c;
  let r = 0,
    g = 0,
    bl = 0;
  if (h < 1 / 6) [r, g, bl] = [c, x, 0];
  else if (h < 2 / 6) [r, g, bl] = [x, c, 0];
  else if (h < 3 / 6) [r, g, bl] = [0, c, x];
  else if (h < 4 / 6) [r, g, bl] = [0, x, c];
  else if (h < 5 / 6) [r, g, bl] = [x, 0, c];
  else [r, g, bl] = [c, 0, x];
  return `rgba(${Math.round((r + m) * 255)}, ${Math.round((g + m) * 255)}, ${Math.round(
    (bl + m) * 255
  )}, ${a})`;
}

export function RecoveryTree({ className }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const treeCanvasRef = useRef<HTMLCanvasElement>(null);
  const leafCanvasRef = useRef<HTMLCanvasElement>(null);
  const rafTree = useRef<number>();
  const rafLeaf = useRef<number>();
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const treeRef = useRef<Tree | null>(null);
  const leavesRef = useRef<Leaf[]>([]);

  const makeBranch = (start: Vec, stw: number, angle: number, gen: number): Branch => ({
    position: { ...start },
    stw,
    gen,
    alive: true,
    age: 0,
    angle,
    speed: { x: 0, y: -3.7 }, // faster rise → taller
    maxlife: MAXLIFE * rand(0.55, 1.1),
    deviation: rand(0.5, 0.85),
  });

  const makeTree = (w: number, h: number): Tree => {
    const start = { x: w / 2, y: h * 0.97 };
    const tree: Tree = { branches: [], start, teinte: rand(165, 184) };
    tree.branches.push({
      ...makeBranch(start, 26 * Math.sqrt(start.y / h), 0, 1), // thicker trunk
      maxlife: MAXLIFE * rand(1.1, 1.5), // longer trunk before branching
    });
    return tree;
  };

  const grow = (b: Branch, tree: Tree) => {
    if (!b.alive) return;
    b.age++;
    if (b.age >= Math.floor(b.maxlife / b.gen) || rand(1) < 0.016 * b.gen) {
      b.alive = false;
      if (b.stw > 0.45 && b.gen < 6) {
        const p = { x: b.position.x, y: b.position.y };
        const g = Math.pow(b.gen, 0.9);
        if (rand(1) < 0.92 / g)
          tree.branches.push(makeBranch(p, b.stw * rand(0.55, 0.78), b.angle + rand(0.5, 0.95) * b.deviation, b.gen + 0.2));
        if (rand(1) < 0.92 / g)
          tree.branches.push(makeBranch(p, b.stw * rand(0.55, 0.78), b.angle - rand(0.5, 0.95) * b.deviation, b.gen + 0.2));
        if (b.gen < 4 && rand(1) < 0.6 / Math.pow(b.gen, 1.1))
          tree.branches.push(makeBranch(p, b.stw * rand(0.62, 0.82), b.angle + rand(0.25, 0.6) * b.deviation, b.gen + 0.15));
        if (b.gen < 4 && rand(1) < 0.6 / Math.pow(b.gen, 1.1))
          tree.branches.push(makeBranch(p, b.stw * rand(0.62, 0.82), b.angle - rand(0.25, 0.6) * b.deviation, b.gen + 0.15));
      }
    } else {
      b.speed.x += rand(-0.13, 0.13);
    }
  };

  const display = (b: Branch, tree: Tree, ctx: CanvasRenderingContext2D) => {
    const x0 = b.position.x;
    const y0 = b.position.y;
    b.position.x += -b.speed.x * Math.cos(b.angle) + b.speed.y * Math.sin(b.angle);
    b.position.y += b.speed.x * Math.sin(b.angle) + b.speed.y * Math.cos(b.angle);

    // glow halo
    ctx.strokeStyle = hsbToRgb(tree.teinte + 6 * b.gen, 150, 230, 0.05);
    ctx.lineWidth = Math.max(0.5, b.stw * 1.7 - (b.age / b.maxlife) * b.stw * 0.4);
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(b.position.x, b.position.y);
    ctx.stroke();

    // main stroke — deeper at the trunk, brighter mint at the tips
    const hue = tree.teinte + b.gen * 4;
    const bright = Math.min(238, 120 + 24 * b.gen);
    ctx.strokeStyle = hsbToRgb(hue, 150, bright, 0.58);
    ctx.lineWidth = Math.max(0.3, b.stw - (b.age / b.maxlife) * b.stw * 0.4);
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(b.position.x, b.position.y);
    ctx.stroke();

    // tip bud
    if (b.gen >= 3) {
      ctx.fillStyle = hsbToRgb(hue + 6, 120, 252, 0.5);
      ctx.beginPath();
      ctx.arc(b.position.x, b.position.y, Math.max(0.6, b.stw * 0.5), 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const spawnLeaf = (w: number, h: number, fromTop: boolean): Leaf => ({
    // originate around the canopy (upper-centre), spread across the panel
    x: w / 2 + rand(-0.55, 0.55) * w,
    y: fromTop ? rand(-0.15, 0.45) * h : rand(0, h),
    vy: rand(0.25, 0.85),
    size: rand(3.5, 8),
    swayAmp: rand(8, 26),
    swaySpeed: rand(0.0006, 0.0016),
    phase: rand(0, Math.PI * 2),
    angle: rand(0, Math.PI * 2),
    spin: rand(-0.01, 0.01),
    hue: rand(160, 182),
    alpha: rand(0.25, 0.6),
  });

  const drawLeaf = (l: Leaf, ctx: CanvasRenderingContext2D) => {
    ctx.save();
    ctx.translate(l.x, l.y);
    ctx.rotate(l.angle);
    ctx.fillStyle = hsbToRgb(l.hue, 150, 225, l.alpha);
    ctx.beginPath();
    ctx.ellipse(0, 0, l.size, l.size * 0.46, 0, 0, Math.PI * 2);
    ctx.fill();
    // midrib
    ctx.strokeStyle = hsbToRgb(l.hue, 120, 150, l.alpha * 0.7);
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(-l.size, 0);
    ctx.lineTo(l.size, 0);
    ctx.stroke();
    ctx.restore();
  };

  const sizeCanvas = useCallback((ref: HTMLCanvasElement | null, w: number, h: number) => {
    if (!ref) return null;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    ref.width = w * dpr;
    ref.height = h * dpr;
    const ctx = ref.getContext("2d");
    if (!ctx) return null;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    return ctx;
  }, []);

  const start = useCallback(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const w = wrap.clientWidth;
    const h = wrap.clientHeight;
    if (w === 0 || h === 0) return;

    const treeCtx = sizeCanvas(treeCanvasRef.current, w, h);
    const leafCtx = sizeCanvas(leafCanvasRef.current, w, h);
    if (!treeCtx) return;

    treeRef.current = makeTree(w, h);
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    // --- tree growth ---
    if (reduce) {
      const tree = treeRef.current;
      let guard = 0;
      while (tree.branches.some((b) => b.alive) && guard++ < 6000) {
        tree.branches.forEach((b) => {
          if (b.alive) {
            grow(b, tree);
            display(b, tree, treeCtx);
          }
        });
      }
    } else {
      const tick = () => {
        const tree = treeRef.current;
        if (!tree) return;
        let alive = false;
        tree.branches.forEach((b) => {
          if (b.alive) {
            alive = true;
            grow(b, tree);
            display(b, tree, treeCtx);
          }
        });
        if (alive) {
          rafTree.current = requestAnimationFrame(tick);
        } else {
          timerRef.current = setTimeout(() => start(), 16000);
        }
      };
      rafTree.current = requestAnimationFrame(tick);
    }

    // --- falling leaves (continuous, skipped under reduced motion) ---
    if (leafCtx && !reduce) {
      leavesRef.current = Array.from({ length: LEAF_COUNT }, () => spawnLeaf(w, h, false));
      let last = 0;
      const animateLeaves = (t: number) => {
        const dt = last ? t - last : 16;
        last = t;
        leafCtx.clearRect(0, 0, w, h);
        for (const l of leavesRef.current) {
          l.y += l.vy * (dt / 16);
          l.x += Math.sin(t * l.swaySpeed + l.phase) * (l.swayAmp / 80);
          l.angle += l.spin;
          if (l.y > h + 16) Object.assign(l, spawnLeaf(w, h, true), { y: -12 });
          drawLeaf(l, leafCtx);
        }
        rafLeaf.current = requestAnimationFrame(animateLeaves);
      };
      rafLeaf.current = requestAnimationFrame(animateLeaves);
    }
  }, [sizeCanvas]);

  useEffect(() => {
    start();
    let resizeRaf: number;
    const onResize = () => {
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(() => start());
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      if (rafTree.current) cancelAnimationFrame(rafTree.current);
      if (rafLeaf.current) cancelAnimationFrame(rafLeaf.current);
      if (timerRef.current) clearTimeout(timerRef.current);
      cancelAnimationFrame(resizeRaf);
    };
  }, [start]);

  return (
    <div ref={wrapRef} className={className} aria-hidden>
      <canvas ref={treeCanvasRef} className="absolute inset-0 h-full w-full" />
      <canvas ref={leafCanvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
