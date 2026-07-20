"use client";

import type { CSSProperties, KeyboardEvent } from "react";
import type { BodyRegion } from "@/lib/care-catalog";

interface Props {
  selected: BodyRegion[];
  onToggle: (region: BodyRegion) => void;
  labelFor: (region: BodyRegion) => string;
}

const ON_FILL = "#5eead4";
const ON_STROKE = "#0f766e";
const OFF_FILL = "#eef7f5";
const OFF_STROKE = "#c0ddd6";

/**
 * Interactive body figure ("muñeco") — front view with ~19 tappable regions
 * (head, neck, shoulders, chest, arms, elbows, hands, abdomen, hips, thighs,
 * knees, lower legs, feet), left/right distinguished. Zero-cost, pure SVG.
 */
export function BodyMap({ selected, onToggle, labelFor }: Props) {
  function partProps(region: BodyRegion) {
    const on = selected.includes(region);
    const style: CSSProperties = {
      fill: on ? ON_FILL : OFF_FILL,
      stroke: on ? ON_STROKE : OFF_STROKE,
      strokeWidth: on ? 3 : 2,
      cursor: "pointer",
      transition: "fill .15s ease, stroke .15s ease",
      outline: "none",
    };
    return {
      style,
      role: "button" as const,
      tabIndex: 0,
      "aria-pressed": on,
      "aria-label": labelFor(region),
      onClick: () => onToggle(region),
      onKeyDown: (event: KeyboardEvent<SVGElement>) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onToggle(region);
        }
      },
    };
  }

  return (
    <svg
      viewBox="0 0 160 322"
      width="170"
      height="342"
      role="group"
      aria-label="Figura del cuerpo — toca las partes lastimadas"
      className="mx-auto block"
    >
      {/* torso (drawn first, limbs + joints on top) */}
      <rect {...partProps("pecho")} x={56} y={58} width={48} height={36} rx={10} />
      <rect {...partProps("abdomen")} x={58} y={96} width={44} height={34} rx={8} />
      <rect {...partProps("cadera")} x={56} y={131} width={48} height={22} rx={10} />

      {/* upper arms */}
      <rect {...partProps("brazo_izq")} x={30} y={64} width={15} height={54} rx={7} />
      <rect {...partProps("brazo_der")} x={115} y={64} width={15} height={54} rx={7} />

      {/* thighs + lower legs */}
      <rect {...partProps("muslo_izq")} x={58} y={152} width={20} height={60} rx={9} />
      <rect {...partProps("muslo_der")} x={82} y={152} width={20} height={60} rx={9} />
      <rect {...partProps("pierna_izq")} x={60} y={224} width={17} height={66} rx={8} />
      <rect {...partProps("pierna_der")} x={83} y={224} width={17} height={66} rx={8} />

      {/* head + neck */}
      <circle {...partProps("cabeza")} cx={80} cy={28} r={20} />
      <rect {...partProps("cuello")} x={72} y={47} width={16} height={12} rx={4} />

      {/* shoulders */}
      <circle {...partProps("hombro_izq")} cx={52} cy={66} r={12} />
      <circle {...partProps("hombro_der")} cx={108} cy={66} r={12} />

      {/* elbows */}
      <circle {...partProps("codo_izq")} cx={37} cy={122} r={9} />
      <circle {...partProps("codo_der")} cx={123} cy={122} r={9} />

      {/* hands */}
      <circle {...partProps("mano_izq")} cx={35} cy={150} r={10} />
      <circle {...partProps("mano_der")} cx={125} cy={150} r={10} />

      {/* knees */}
      <circle {...partProps("rodilla_izq")} cx={68} cy={216} r={11} />
      <circle {...partProps("rodilla_der")} cx={92} cy={216} r={11} />

      {/* feet */}
      <rect {...partProps("pie_izq")} x={58} y={294} width={20} height={15} rx={6} />
      <rect {...partProps("pie_der")} x={82} y={294} width={20} height={15} rx={6} />
    </svg>
  );
}
