import React, { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import "./text-loop.css";

const VIEW_W = 1200;
const VIEW_H = 520;
const CX = VIEW_W / 2;
const CY = VIEW_H / 2;
const EDGE_PAD = 6;

const buildPath = (shape, curviness, ribbonWidth) => {
  const c = Math.max(0, curviness);
  const room = Math.max(20, CY - Math.max(0, ribbonWidth) / 2 - EDGE_PAD);

  switch (shape) {
    case "circle": {
      const radius = Math.min(90 + c * 0.95, room);
      return `M ${CX - radius} ${CY} A ${radius} ${radius} 0 1 1 ${CX + radius} ${CY} A ${radius} ${radius} 0 1 1 ${CX - radius} ${CY} Z`;
    }
    case "infinity": {
      const width = 150 + c * 1.4;
      const height = Math.min(60 + c * 0.95, room);
      return [
        `M ${CX} ${CY}`,
        `C ${CX + width * 0.55} ${CY - height} ${CX + width} ${CY - height} ${CX + width} ${CY}`,
        `C ${CX + width} ${CY + height} ${CX + width * 0.55} ${CY + height} ${CX} ${CY}`,
        `C ${CX - width * 0.55} ${CY - height} ${CX - width} ${CY - height} ${CX - width} ${CY}`,
        `C ${CX - width} ${CY + height} ${CX - width * 0.55} ${CY + height} ${CX} ${CY}`,
        "Z",
      ].join(" ");
    }
    case "arch": {
      const archHeight = Math.min(120 + c * 1.1, room * 2);
      return `M 120 ${CY + archHeight / 2} Q ${CX} ${CY - archHeight * 1.5} ${VIEW_W - 120} ${CY + archHeight / 2}`;
    }
    case "line":
      return `M -320 ${CY} L ${VIEW_W + 320} ${CY}`;
    case "wave":
    default: {
      const waveHeight = Math.min(c * 2.2, room * 2);
      return `M -320 ${CY} Q -160 ${CY - waveHeight} 0 ${CY} T 320 ${CY} T 640 ${CY} T 960 ${CY} T 1280 ${CY} T ${VIEW_W + 320} ${CY}`;
    }
  }
};

export function TextLoop({
  text = "React ✦ Bits",
  shape = "wave",
  path,
  speed = 90,
  direction = "forward",
  separator = "✦",
  curviness = 90,
  fontSize = 46,
  fontWeight = 800,
  letterSpacing = 2,
  uppercase = true,
  color = "#ffffff",
  ribbon = true,
  ribbonColor = "#5227FF",
  ribbonWidth = 86,
  pauseOnHover = true,
  className = "",
  style = {},
  onMetricsChange = null,
}) {
  const containerRef = useRef(null);
  const pathRef = useRef(null);
  const measureTextRef = useRef(null);
  const textPathRef1 = useRef(null);
  const textPathRef2 = useRef(null);

  const [metrics, setMetrics] = useState({ length: 0, reps: 1 });
  const pathId = `text-loop-${useId().replace(/:/g, "")}`;

  const pathD = useMemo(
    () => path || buildPath(shape, curviness, ribbonWidth),
    [path, shape, curviness, ribbonWidth]
  );

  const textItem = useMemo(() => {
    const raw = uppercase ? String(text).toUpperCase() : String(text);
    const sep = separator ? `\u00A0${separator}\u00A0` : "\u00A0\u00A0\u00A0";
    return `${raw}${sep}`;
  }, [text, separator, uppercase]);

  const textStyle = useMemo(
    () => ({
      fontSize: `${fontSize}px`,
      fontWeight,
      letterSpacing: `${letterSpacing}px`,
      fontFamily: '"Plus Jakarta Sans", "Inter", -apple-system, sans-serif',
    }),
    [fontSize, fontWeight, letterSpacing]
  );

  useLayoutEffect(() => {
    const pathEl = pathRef.current;
    const measureEl = measureTextRef.current;
    if (!pathEl || !measureEl) return;
    let cancelled = false;

    const measure = () => {
      if (cancelled) return;
      let totalPathLength = 0;
      let textLength = 0;
      try {
        totalPathLength = pathEl.getTotalLength();
        textLength = measureEl.getComputedTextLength();
      } catch {
        return;
      }
      if (!totalPathLength) return;
      const repetitions =
        textLength > 0 ? Math.max(1, Math.round(totalPathLength / textLength)) : 1;

      setMetrics((prev) => {
        if (prev.length === totalPathLength && prev.reps === repetitions) return prev;
        const next = { length: totalPathLength, reps: repetitions };
        if (onMetricsChange) onMetricsChange(next);
        return next;
      });
    };

    measure();
    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(measure).catch(() => {});
    }

    return () => {
      cancelled = true;
    };
  }, [pathD, textItem, fontSize, fontWeight, letterSpacing, onMetricsChange]);

  useEffect(() => {
    const { length } = metrics;
    const tp1 = textPathRef1.current;
    const tp2 = textPathRef2.current;
    if (!tp1 || !tp2 || !length) return;

    const updateOffsets = (offset) => {
      const offset2 = offset >= 0 ? offset - length : offset + length;
      tp1.setAttribute("startOffset", String(offset));
      tp2.setAttribute("startOffset", String(offset2));
    };

    updateOffsets(0);

    if (
      (typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches) ||
      speed <= 0
    ) {
      return;
    }

    const state = { offset: 0 };
    const tween = gsap.to(state, {
      offset: direction === "reverse" ? -length : length,
      duration: length / speed,
      ease: "none",
      repeat: -1,
      onUpdate: () => updateOffsets(state.offset),
    });

    const el = containerRef.current;
    const onEnter = () => tween.pause();
    const onLeave = () => tween.resume();

    if (pauseOnHover && el) {
      el.addEventListener("pointerenter", onEnter);
      el.addEventListener("pointerleave", onLeave);
    }

    return () => {
      tween.kill();
      if (pauseOnHover && el) {
        el.removeEventListener("pointerenter", onEnter);
        el.removeEventListener("pointerleave", onLeave);
      }
    };
  }, [metrics, speed, direction, pauseOnHover]);

  const repeatedText = textItem.repeat(metrics.reps);
  const pathLength = metrics.length || undefined;

  return (
    <div
      ref={containerRef}
      className={`text-loop ${className}`.trim()}
      style={style}
    >
      <svg
        className="text-loop-svg"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={text}
      >
        <path
          ref={pathRef}
          id={pathId}
          d={pathD}
          fill="none"
          stroke={ribbon ? ribbonColor : "none"}
          strokeWidth={ribbon ? ribbonWidth : 0}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <text
          ref={measureTextRef}
          className="text-loop-measure"
          style={textStyle}
          aria-hidden="true"
        >
          {textItem}
        </text>
        <text
          className="text-loop-text"
          style={textStyle}
          fill={color}
          dominantBaseline="central"
          aria-hidden="true"
          textLength={pathLength}
          lengthAdjust="spacing"
        >
          <textPath ref={textPathRef1} href={`#${pathId}`} startOffset={0}>
            {repeatedText}
          </textPath>
        </text>
        <text
          className="text-loop-text"
          style={textStyle}
          fill={color}
          dominantBaseline="central"
          aria-hidden="true"
          textLength={pathLength}
          lengthAdjust="spacing"
        >
          <textPath ref={textPathRef2} href={`#${pathId}`} startOffset={0}>
            {repeatedText}
          </textPath>
        </text>
      </svg>
    </div>
  );
}

export default TextLoop;
