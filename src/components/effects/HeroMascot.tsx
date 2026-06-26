"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * A tiny friendly mascot whose eyes follow the cursor (and blinks, and grins
 * when you hover). Pure delight — a little hello to start the visit in a good
 * mood. Self-contained SVG; reduced-motion keeps the idle bob still.
 */
export function HeroMascot({ className }: { className?: string }) {
  const ref = useRef<SVGSVGElement>(null);
  const [pupil, setPupil] = useState({ x: 0, y: 0 });
  const [blink, setBlink] = useState(false);
  const [hover, setHover] = useState(false);
  const [pop, setPop] = useState(false);

  useEffect(() => {
    let raf = 0;
    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height * 0.42; // eyes sit above center
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const clamp = (v: number, m: number) => Math.max(-m, Math.min(m, v / 14));
        setPupil({ x: clamp(dx, 2.6), y: clamp(dy, 2.4) });
      });
    };
    window.addEventListener("mousemove", onMove);
    const blinkTimer = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 140);
    }, 3600);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
      clearInterval(blinkTimer);
    };
  }, []);

  return (
    <div
      className={cn("cursor-pointer select-none", className)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => {
        setPop(true);
        setTimeout(() => setPop(false), 560);
      }}
      aria-hidden
    >
      <div
        className={
          pop
            ? "animate-[mascotPop_0.56s_ease]"
            : "motion-safe:animate-[mascotBob_4s_ease-in-out_infinite]"
        }
      >
        <svg ref={ref} viewBox="0 0 60 70" className="h-full w-full overflow-visible">
          {/* shadow */}
          <ellipse cx="30" cy="66" rx="16" ry="3" fill="#0f766e" opacity="0.12" />
          {/* body — friendly mint gumdrop */}
          <path
            d="M8 60 V30 a22 22 0 0 1 44 0 V60 a4 4 0 0 1 -4 4 H12 a4 4 0 0 1 -4 -4 Z"
            fill="#2dd4bf"
          />
          {/* little arm waving on hover */}
          <circle cx={hover ? 50 : 51} cy={hover ? 30 : 40} r="4.5" fill="#14b8a6" className="transition-all duration-300" />
          {/* eyes */}
          <g>
            <ellipse cx="22" cy="34" rx="6.4" ry={blink ? 0.9 : 6.6} fill="#fff" className="transition-all duration-100" />
            <ellipse cx="38" cy="34" rx="6.4" ry={blink ? 0.9 : 6.6} fill="#fff" className="transition-all duration-100" />
            {!blink && (
              <>
                <circle cx={22 + pupil.x} cy={34 + pupil.y} r="3" fill="#0f3d3a" />
                <circle cx={38 + pupil.x} cy={34 + pupil.y} r="3" fill="#0f3d3a" />
                <circle cx={22 + pupil.x + 1} cy={34 + pupil.y - 1} r="0.9" fill="#fff" />
                <circle cx={38 + pupil.x + 1} cy={34 + pupil.y - 1} r="0.9" fill="#fff" />
              </>
            )}
          </g>
          {/* cheeks */}
          <circle cx="14" cy="44" r="3" fill="#fb7185" opacity="0.5" />
          <circle cx="46" cy="44" r="3" fill="#fb7185" opacity="0.5" />
          {/* mouth — grins on hover, gasps when poked */}
          {pop ? (
            <ellipse cx="30" cy="48" rx="3.4" ry="4.4" fill="#0f3d3a" />
          ) : (
            <path
              d={hover ? "M24 46 q6 7 12 0" : "M26 47 q4 3 8 0"}
              stroke="#0f3d3a"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
              className="transition-all duration-300"
            />
          )}
        </svg>
      </div>
      <style>{`@keyframes mascotBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}@keyframes mascotPop{0%{transform:translateY(0) scaleX(1) scaleY(1)}30%{transform:translateY(-16px) scaleX(.88) scaleY(1.12)}62%{transform:translateY(0) scaleX(1.12) scaleY(.88)}100%{transform:translateY(0) scaleX(1) scaleY(1)}}`}</style>
    </div>
  );
}
