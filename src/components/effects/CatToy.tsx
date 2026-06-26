import { cn } from "@/lib/utils";

/**
 * A little cat batting a ball — a looping, pure-CSS SVG animation to lighten
 * the page while there's a lot to read. No JS, no deps; motion pauses under
 * prefers-reduced-motion.
 */
export function CatToy({ className }: { className?: string }) {
  return (
    <div className={cn("select-none", className)} aria-hidden>
      <svg viewBox="0 0 160 120" className="h-full w-full overflow-visible">
        <style>{`
          .cat-tail{transform-origin:104px 92px;animation:catTail 1.6s ease-in-out infinite}
          .cat-paw{transform-origin:64px 92px;animation:catPaw 1.3s ease-in-out infinite}
          .cat-ball{transform-origin:center;animation:catBall 1.3s ease-in-out infinite}
          .cat-ear-l{transform-origin:64px 44px;animation:catEar 3.2s ease-in-out infinite}
          @keyframes catTail{0%,100%{transform:rotate(-10deg)}50%{transform:rotate(12deg)}}
          @keyframes catPaw{0%,100%{transform:rotate(2deg)}45%{transform:rotate(-20deg)}55%{transform:rotate(-20deg)}}
          @keyframes catBall{0%,100%{transform:translate(0,0)}30%{transform:translate(6px,-22px) rotate(120deg)}55%{transform:translate(10px,0) rotate(180deg)}}
          @keyframes catEar{0%,92%,100%{transform:rotate(0)}96%{transform:rotate(-9deg)}}
          @media (prefers-reduced-motion: reduce){.cat-tail,.cat-paw,.cat-ball,.cat-ear-l{animation:none}}
        `}</style>

        {/* ground shadow */}
        <ellipse cx="78" cy="112" rx="46" ry="5" fill="#0f766e" opacity="0.12" />

        {/* tail */}
        <path
          className="cat-tail"
          d="M104 92 C124 90 130 70 120 58"
          stroke="#134e4a"
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
        />

        {/* body */}
        <path d="M50 110 C50 74 106 74 106 110 Z" fill="#134e4a" />
        <ellipse cx="78" cy="100" rx="17" ry="11" fill="#0f766e" opacity="0.55" />

        {/* head */}
        <circle cx="78" cy="60" r="24" fill="#134e4a" />
        {/* ears */}
        <path className="cat-ear-l" d="M60 46 L54 26 L76 42 Z" fill="#134e4a" />
        <path d="M96 46 L102 26 L80 42 Z" fill="#134e4a" />
        <path d="M61 42 L58 32 L70 41 Z" fill="#5eead4" opacity="0.6" />
        <path d="M95 42 L98 32 L86 41 Z" fill="#5eead4" opacity="0.6" />

        {/* eyes (happy) + highlights */}
        <circle cx="69" cy="58" r="3.4" fill="#ecfeff" />
        <circle cx="87" cy="58" r="3.4" fill="#ecfeff" />
        <circle cx="69.6" cy="58.6" r="1.7" fill="#0f3d3a" />
        <circle cx="87.6" cy="58.6" r="1.7" fill="#0f3d3a" />
        {/* nose + mouth */}
        <path d="M75 67 L81 67 L78 70 Z" fill="#fb7185" />
        <path d="M78 70 q-3 3 -6 1 M78 70 q3 3 6 1" stroke="#0f3d3a" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        {/* whiskers */}
        <path d="M64 64 H50 M64 68 H52 M92 64 H106 M92 68 H104" stroke="#5eead4" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />

        {/* front paw that taps */}
        <ellipse className="cat-paw" cx="60" cy="106" rx="7" ry="5" fill="#0d3f3b" />

        {/* the ball */}
        <g className="cat-ball">
          <circle cx="40" cy="104" r="10" fill="#f59e0b" />
          <circle cx="36.5" cy="100.5" r="3" fill="#fff" opacity="0.55" />
        </g>
      </svg>
    </div>
  );
}
