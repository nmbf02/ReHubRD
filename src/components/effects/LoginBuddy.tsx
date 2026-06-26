"use client";

import { useEffect, useRef, useState } from "react";

type Field = "idle" | "email" | "password";

/**
 * The classic login buddy: eyes follow the cursor, it watches you type your
 * username, and politely covers its eyes when you enter your password.
 * Self-contained SVG; no deps.
 */
export function LoginBuddy({ state }: { state: Field }) {
  const ref = useRef<SVGSVGElement>(null);
  const [pupil, setPupil] = useState({ x: 0, y: 0 });
  const [blink, setBlink] = useState(false);
  const covering = state === "password";

  useEffect(() => {
    if (covering) return;
    let raf = 0;
    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height * 0.46;
        const clamp = (v: number, m: number) => Math.max(-m, Math.min(m, v / 16));
        setPupil({ x: clamp(e.clientX - cx, 3), y: clamp(e.clientY - cy, 2.6) });
      });
    };
    window.addEventListener("mousemove", onMove);
    const t = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 130);
    }, 4200);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
      clearInterval(t);
    };
  }, [covering]);

  // when typing the username, the buddy looks down at the field
  const px = state === "email" ? 0 : pupil.x;
  const py = state === "email" ? 2.4 : pupil.y;
  const closedEyes = blink && !covering;

  return (
    <svg
      ref={ref}
      viewBox="0 0 120 116"
      className="h-28 w-28"
      role="img"
      aria-label="Asistente de inicio de sesión"
    >
      {/* shadow */}
      <ellipse cx="60" cy="110" rx="30" ry="4" fill="#0f766e" opacity="0.12" />
      {/* ears */}
      <circle cx="34" cy="34" r="9" fill="#14b8a6" />
      <circle cx="86" cy="34" r="9" fill="#14b8a6" />
      {/* head */}
      <path d="M22 60 a38 38 0 0 1 76 0 V92 a10 10 0 0 1 -10 10 H32 a10 10 0 0 1 -10 -10 Z" fill="#2dd4bf" />

      {/* eyes */}
      <ellipse cx="46" cy="58" rx="8" ry={closedEyes ? 1 : 8.4} fill="#fff" className="transition-all duration-100" />
      <ellipse cx="74" cy="58" rx="8" ry={closedEyes ? 1 : 8.4} fill="#fff" className="transition-all duration-100" />
      {!closedEyes && (
        <>
          <circle cx={46 + px} cy={58 + py} r="3.8" fill="#0f3d3a" />
          <circle cx={74 + px} cy={58 + py} r="3.8" fill="#0f3d3a" />
          <circle cx={46 + px + 1.2} cy={58 + py - 1.2} r="1.1" fill="#fff" />
          <circle cx={74 + px + 1.2} cy={58 + py - 1.2} r="1.1" fill="#fff" />
        </>
      )}

      {/* cheeks */}
      <circle cx="34" cy="72" r="4" fill="#fb7185" opacity="0.5" />
      <circle cx="86" cy="72" r="4" fill="#fb7185" opacity="0.5" />
      {/* mouth */}
      <path
        d={covering ? "M54 78 q6 5 12 0" : "M52 77 q8 6 16 0"}
        stroke="#0f3d3a"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
        className="transition-all duration-300"
      />

      {/* paws — rest at the bottom, swing up to cover the eyes on password */}
      <g
        className="transition-transform duration-300 ease-out"
        style={{ transform: covering ? "translate(0px,0px)" : "translate(-10px,44px)" }}
      >
        <ellipse cx="44" cy="56" rx="11" ry="13" fill="#14b8a6" />
      </g>
      <g
        className="transition-transform duration-300 ease-out"
        style={{ transform: covering ? "translate(0px,0px)" : "translate(10px,44px)" }}
      >
        <ellipse cx="76" cy="56" rx="11" ry="13" fill="#14b8a6" />
      </g>
    </svg>
  );
}
