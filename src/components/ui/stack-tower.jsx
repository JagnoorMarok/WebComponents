import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, motionValue, useAnimationFrame, useTransform } from "motion/react";
import "./stack-tower.css";

// Color blending helper
function mix(a, b, t) {
  const cleanA = a.startsWith("#") ? a.slice(1) : a;
  const cleanB = b.startsWith("#") ? b.slice(1) : b;
  const pa = parseInt(cleanA, 16);
  const pb = parseInt(cleanB, 16);
  const ar = (pa >> 16) & 0xff;
  const ag = (pa >> 8) & 0xff;
  const ab = pa & 0xff;
  const br = (pb >> 16) & 0xff;
  const bg = (pb >> 8) & 0xff;
  const bb = pb & 0xff;
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return `#${((r << 16) | (g << 8) | bl).toString(16).padStart(6, "0")}`;
}

function TowerRow({
  text,
  rowIndex,
  phase,
  hover,
  fg,
  dim,
  accent,
  fontSize,
  amplitude = 22,
  hoverScaleBoost = 0.1,
  onEnter,
  onLeave,
}) {
  const rowOffset = rowIndex * 0.35;

  const transform = useTransform([phase, hover], ([p, h]) => {
    const local = p * Math.PI * 2 + rowOffset;
    const scaleX = 0.55 + 0.45 * Math.cos(local);
    const shiftX = Math.sin(local) * amplitude;
    const skewX = Math.sin(local) * 6;
    const boost = 1 + h * hoverScaleBoost;
    return `translateX(${shiftX}px) skewX(${skewX}deg) scale(${
      Math.max(0.08, scaleX) * boost
    }, ${boost})`;
  });

  const color = useTransform([phase, hover], ([p, h]) => {
    const local = p * Math.PI * 2 + rowOffset;
    const tt = (Math.cos(local) + 1) / 2;
    const base = mix(dim, fg, tt);
    if (h < 0.002) return base;
    return mix(base, accent, h);
  });

  return (
    <div
      onPointerEnter={() => onEnter(rowIndex)}
      onPointerLeave={() => onLeave(rowIndex)}
      onPointerDown={() => onEnter(rowIndex)}
      onPointerUp={() => onLeave(rowIndex)}
      onPointerCancel={() => onLeave(rowIndex)}
      className="st-row-wrapper"
    >
      <motion.div
        className="st-row-text"
        style={{
          fontSize,
          transform,
          color,
        }}
      >
        {text}
      </motion.div>
    </div>
  );
}

export function StackTower({
  words = ["STACK", "TOWER"],
  rowCount = 12,
  secondsPerCycle = 5,
  amplitude = 22,
  hoverScaleBoost = 0.12,
  hoverEaseRate = 10,
  accentColor = "#F16D14",
  mode = "dark",
  fontSize = "clamp(1.75rem, 8.5vw, 4.25rem)",
  className = "",
  style = {},
}) {
  const rootRef = useRef(null);
  const isDark = mode === "dark";

  const bg = isDark ? "#0A0A0A" : "#EFEEE6";
  const fg = isDark ? "#EFEEE6" : "#0A0A0A";
  const dim = isDark ? "#3A3936" : "#C7C3B8";
  const accent = accentColor || "#F16D14";

  const fadeTop = isDark
    ? "linear-gradient(to bottom, #0A0A0A 0%, rgba(10,10,10,0) 100%)"
    : "linear-gradient(to bottom, #EFEEE6 0%, rgba(239,238,230,0) 100%)";
  const fadeBot = isDark
    ? "linear-gradient(to top, #0A0A0A 0%, rgba(10,10,10,0) 100%)"
    : "linear-gradient(to top, #EFEEE6 0%, rgba(239,238,230,0) 100%)";

  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const hoveredIndexRef = useRef(null);

  // Motion values for phase and hover per row
  const phases = useMemo(
    () => Array.from({ length: rowCount }, () => motionValue(0)),
    [rowCount]
  );

  const hovers = useMemo(
    () => Array.from({ length: rowCount }, () => motionValue(0)),
    [rowCount]
  );

  const hoverEased = useRef(Array(rowCount).fill(0));
  const prevTs = useRef(null);

  useEffect(() => {
    hoverEased.current = Array(rowCount).fill(0);
  }, [rowCount]);

  useAnimationFrame((t) => {
    if (reducedMotion) {
      phases.forEach((p, i) => p.set(0.2 + i * 0.03));
      return;
    }
    const last = prevTs.current;
    prevTs.current = t;
    if (last == null) return;

    const dtSec = (t - last) / 1000;
    const safeCycle = Math.max(0.5, secondsPerCycle);
    const phaseDt = dtSec / safeCycle;
    const alpha = 1 - Math.exp(-hoverEaseRate * dtSec);

    const hov = hoveredIndexRef.current;
    for (let i = 0; i < rowCount; i++) {
      if (phases[i]) {
        phases[i].set(phases[i].get() + phaseDt);
      }

      if (hovers[i]) {
        const target = i === hov ? 1 : 0;
        const cur = hoverEased.current[i] || 0;
        const next = cur + (target - cur) * alpha;
        hoverEased.current[i] = next;
        hovers[i].set(next);
      }
    }
  });

  const handleEnter = (i) => {
    hoveredIndexRef.current = i;
  };

  const handleLeave = (i) => {
    if (hoveredIndexRef.current === i) {
      hoveredIndexRef.current = null;
    }
  };

  const rows = Array.from(
    { length: rowCount },
    (_, i) => words[i % words.length]
  );

  return (
    <div
      ref={rootRef}
      className={`st-root ${isDark ? "st-dark" : "st-light"} ${className}`}
      style={{ backgroundColor: bg, ...style }}
    >
      <div className="st-column">
        {rows.map((word, i) => (
          <TowerRow
            key={i}
            text={word}
            rowIndex={i}
            phase={phases[i]}
            hover={hovers[i]}
            fg={fg}
            dim={dim}
            accent={accent}
            fontSize={fontSize}
            amplitude={amplitude}
            hoverScaleBoost={hoverScaleBoost}
            onEnter={handleEnter}
            onLeave={handleLeave}
          />
        ))}

        {/* Depth Fog / Fade Masks */}
        <div
          aria-hidden
          className="st-fade-top"
          style={{ background: fadeTop }}
        />
        <div
          aria-hidden
          className="st-fade-bottom"
          style={{ background: fadeBot }}
        />
      </div>
    </div>
  );
}

export default StackTower;
