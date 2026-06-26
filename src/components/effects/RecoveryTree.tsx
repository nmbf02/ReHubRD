"use client";

import { useRef, useEffect, useCallback } from "react";

/**
 * RecoveryTree — a generative tree that grows branch by branch on a transparent
 * canvas, themed in ReHub teal. Growth is the brand metaphor: recovery,
 * branching paths, things taking root again. Sized to its parent container,
 * retina-crisp, and it respects prefers-reduced-motion (renders instantly).
 *
 * Adapted from a recursive L-system sketch; recoloured to the brand and made
 * container-bound + DPR-aware.
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
  coeff: number;
  teinte: number;
}

const MAXLIFE = 17;
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>();
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const treeRef = useRef<Tree | null>(null);

  const makeBranch = (start: Vec, stw: number, angle: number, gen: number): Branch => ({
    position: { ...start },
    stw,
    gen,
    alive: true,
    age: 0,
    angle,
    speed: { x: 0, y: -3.1 },
    maxlife: MAXLIFE * rand(0.5, 1.1),
    deviation: rand(0.5, 0.85),
  });

  const makeTree = (w: number, h: number): Tree => {
    const start = { x: w / 2, y: h * 0.96 };
    const tree: Tree = {
      branches: [],
      start,
      coeff: start.y / (h - 80),
      teinte: rand(165, 184), // teal → mint
    };
    tree.branches.push({
      ...makeBranch(start, 17 * Math.sqrt(start.y / h), 0, 1),
      maxlife: MAXLIFE * rand(0.8, 1.2),
    });
    return tree;
  };

  const grow = (b: Branch, tree: Tree) => {
    if (!b.alive) return;
    b.age++;
    if (b.age >= Math.floor(b.maxlife / b.gen) || rand(1) < 0.02 * b.gen) {
      b.alive = false;
      if (b.stw > 0.5 && b.gen < 5) {
        const p = { x: b.position.x, y: b.position.y };
        const g = Math.pow(b.gen, 0.9);
        if (rand(1) < 0.9 / g)
          tree.branches.push(makeBranch(p, b.stw * rand(0.5, 0.74), b.angle + rand(0.6, 1) * b.deviation, b.gen + 0.2));
        if (rand(1) < 0.9 / g)
          tree.branches.push(makeBranch(p, b.stw * rand(0.5, 0.74), b.angle - rand(0.6, 1) * b.deviation, b.gen + 0.2));
        if (b.gen < 3 && rand(1) < 0.55 / Math.pow(b.gen, 1.1))
          tree.branches.push(makeBranch(p, b.stw * rand(0.6, 0.8), b.angle + rand(0.3, 0.7) * b.deviation, b.gen + 0.15));
        if (b.gen < 3 && rand(1) < 0.55 / Math.pow(b.gen, 1.1))
          tree.branches.push(makeBranch(p, b.stw * rand(0.6, 0.8), b.angle - rand(0.3, 0.7) * b.deviation, b.gen + 0.15));
      }
    } else {
      b.speed.x += rand(-0.14, 0.14);
    }
  };

  const display = (b: Branch, tree: Tree, ctx: CanvasRenderingContext2D) => {
    const x0 = b.position.x;
    const y0 = b.position.y;
    b.position.x += -b.speed.x * Math.cos(b.angle) + b.speed.y * Math.sin(b.angle);
    b.position.y += b.speed.x * Math.sin(b.angle) + b.speed.y * Math.cos(b.angle);

    // glow halo
    ctx.strokeStyle = hsbToRgb(tree.teinte + 6 * b.gen, 150, 230, 0.05);
    ctx.lineWidth = Math.max(0.5, b.stw * 1.6 - (b.age / b.maxlife) * b.stw * 0.4);
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(b.position.x, b.position.y);
    ctx.stroke();

    // main stroke — deeper at the trunk, brighter mint at the tips
    const hue = tree.teinte + b.gen * 4;
    const bright = Math.min(235, 120 + 24 * b.gen);
    ctx.strokeStyle = hsbToRgb(hue, 150, bright, 0.55);
    ctx.lineWidth = Math.max(0.3, b.stw - (b.age / b.maxlife) * b.stw * 0.4);
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(b.position.x, b.position.y);
    ctx.stroke();

    // tip highlight
    if (b.gen >= 3) {
      ctx.fillStyle = hsbToRgb(hue + 6, 120, 250, 0.5);
      ctx.beginPath();
      ctx.arc(b.position.x, b.position.y, Math.max(0.6, b.stw * 0.5), 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const sizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return null;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = wrap.clientWidth;
    const h = wrap.clientHeight;
    if (w === 0 || h === 0) return null;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    return { ctx, w, h };
  }, []);

  const start = useCallback(() => {
    const sized = sizeCanvas();
    if (!sized) return;
    const { ctx, w, h } = sized;
    treeRef.current = makeTree(w, h);

    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (reduce) {
      // render the full tree instantly, no animation
      const tree = treeRef.current;
      let guard = 0;
      while (tree.branches.some((b) => b.alive) && guard++ < 4000) {
        tree.branches.forEach((b) => {
          if (b.alive) {
            grow(b, tree);
            display(b, tree, ctx);
          }
        });
      }
      return;
    }

    const tick = () => {
      const tree = treeRef.current;
      if (!tree) return;
      let alive = false;
      tree.branches.forEach((b) => {
        if (b.alive) {
          alive = true;
          grow(b, tree);
          display(b, tree, ctx);
        }
      });
      if (alive) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        // gentle ambient re-grow after a pause
        timerRef.current = setTimeout(() => start(), 14000);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
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
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (timerRef.current) clearTimeout(timerRef.current);
      cancelAnimationFrame(resizeRaf);
    };
  }, [start]);

  return (
    <div ref={wrapRef} className={className} aria-hidden>
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
