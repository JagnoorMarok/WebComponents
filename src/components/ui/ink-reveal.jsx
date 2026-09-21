import React, { useRef, useEffect, useCallback, useState } from "react";
import "./ink-reveal.css";

function parseColor(c) {
  if (Array.isArray(c) && c.length >= 3) {
    return [c[0], c[1], c[2]];
  }
  if (typeof c === "string") {
    if (c.startsWith("#")) {
      let hex = c.slice(1);
      if (hex.length === 3) {
        hex = hex.split("").map((ch) => ch + ch).join("");
      }
      const num = parseInt(hex, 16);
      return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
    }
    const match = c.match(/\d+/g);
    if (match && match.length >= 3) {
      return [Number(match[0]), Number(match[1]), Number(match[2])];
    }
  }
  return [14, 14, 18];
}

export function InkReveal({
  maskColor = [14, 14, 18],
  brushSize = 128,
  lifetime = 750,
  rStart = 12,
  rVary = 0.45,
  stampStep = 10,
  maxStamps = 250,
  segments = 36,
  wobble = [0.14, 0.08, 0.05],
  gradientInnerRadius = 0.2,
  gradientStops = [0.95, 0.88, 0],
  showCustomCursor = true,
  className = "",
  style = {},
}) {
  const canvasRef = useRef(null);
  const stampsRef = useRef([]);
  const isLoopRunningRef = useRef(false);
  const lastPointRef = useRef(null);
  const dimensionsRef = useRef({ w: 0, h: 0 });

  const [cursorPos, setCursorPos] = useState(null);
  const rgb = parseColor(maskColor);

  // Resize canvas to parent container with device pixel ratio
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = parent.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    dimensionsRef.current = { w, h };
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
      ctx.fillRect(0, 0, w, h);
    }
  }, [rgb[0], rgb[1], rgb[2]]);

  // Draw organic wobbly stamp with radial gradient hole
  const drawStamp = useCallback(
    (ctx, cx, cy, radius, seed, alpha) => {
      const grad = ctx.createRadialGradient(
        cx,
        cy,
        radius * gradientInnerRadius,
        cx,
        cy,
        radius
      );
      grad.addColorStop(0, `rgba(0, 0, 0, ${gradientStops[0] * alpha})`);
      grad.addColorStop(0.5, `rgba(0, 0, 0, ${gradientStops[1] * alpha})`);
      grad.addColorStop(1, `rgba(0, 0, 0, ${gradientStops[2] * alpha})`);

      ctx.fillStyle = grad;
      ctx.beginPath();
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        const offset =
          0.78 +
          wobble[0] * Math.sin(theta * 3 + seed) +
          wobble[1] * Math.sin(theta * 5 + seed * 2.1) +
          wobble[2] * Math.sin(theta * 7 + seed * 0.7);

        const px = cx + Math.cos(theta) * radius * offset;
        const py = cy + Math.sin(theta) * radius * offset;

        if (i === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.closePath();
      ctx.fill();
    },
    [segments, wobble, gradientInnerRadius, gradientStops]
  );

  // Add a new ink stamp
  const addStamp = useCallback(
    (x, y) => {
      const stamps = stampsRef.current;
      if (stamps.length >= maxStamps) {
        stamps.shift();
      }
      stamps.push({
        x,
        y,
        born: performance.now(),
        seed: Math.random() * Math.PI * 2,
        rmax: brushSize * (1 - rVary + Math.random() * rVary),
      });
    },
    [brushSize, rVary, maxStamps]
  );

  // Interpolate along path between consecutive mouse events
  const addStroke = useCallback(
    (x, y) => {
      const last = lastPointRef.current;
      if (!last) {
        addStamp(x, y);
      } else {
        const dx = x - last.x;
        const dy = y - last.y;
        const dist = Math.hypot(dx, dy);
        const steps = Math.max(1, Math.ceil(dist / stampStep));
        for (let i = 1; i <= steps; i++) {
          addStamp(last.x + (dx * i) / steps, last.y + (dy * i) / steps);
        }
      }
      lastPointRef.current = { x, y };
    },
    [addStamp, stampStep]
  );

  // Animation frame render loop
  const renderFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { w, h } = dimensionsRef.current;
    const now = performance.now();
    const stamps = stampsRef.current;

    // Reset background mask
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
    ctx.fillRect(0, 0, w, h);

    // Carve out ink holes into the mask
    ctx.globalCompositeOperation = "destination-out";

    for (let i = stamps.length - 1; i >= 0; i--) {
      const stamp = stamps[i];
      const elapsed = (now - stamp.born) / lifetime;
      if (elapsed >= 1) {
        stamps.splice(i, 1);
        continue;
      }

      // Smooth expansion and quadratic alpha decay
      const easeOut = 1 - Math.pow(1 - elapsed, 3);
      const currentRadius = rStart + (stamp.rmax - rStart) * easeOut;
      const alpha = 1 - elapsed * elapsed;

      drawStamp(ctx, stamp.x, stamp.y, currentRadius, stamp.seed, alpha);
    }

    if (stamps.length > 0) {
      requestAnimationFrame(renderFrame);
    } else {
      isLoopRunningRef.current = false;
    }
  }, [drawStamp, rgb, lifetime, rStart]);

  const triggerRender = useCallback(() => {
    if (!isLoopRunningRef.current) {
      isLoopRunningRef.current = true;
      requestAnimationFrame(renderFrame);
    }
  }, [renderFrame]);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [resizeCanvas]);

  const getRelativeCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handlePointerEnter = (e) => {
    const pt = getRelativeCoordinates(e);
    lastPointRef.current = pt;
    setCursorPos(pt);
    addStroke(pt.x, pt.y);
    triggerRender();
  };

  const handlePointerMove = (e) => {
    const pt = getRelativeCoordinates(e);
    setCursorPos(pt);
    addStroke(pt.x, pt.y);
    triggerRender();
  };

  const handlePointerLeave = () => {
    lastPointRef.current = null;
    setCursorPos(null);
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        className={`ink-reveal-canvas ${className}`}
        style={style}
        onPointerEnter={handlePointerEnter}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onPointerDown={handlePointerEnter}
      />

      {/* Floating Brush Cursor */}
      {showCustomCursor && cursorPos && (
        <div
          className="ink-reveal-cursor"
          style={{
            left: `${cursorPos.x}px`,
            top: `${cursorPos.y}px`,
            width: `${brushSize * 0.85}px`,
            height: `${brushSize * 0.85}px`,
          }}
          aria-hidden="true"
        >
          <div className="ink-reveal-cursor-dot" />
        </div>
      )}
    </>
  );
}

export default InkReveal;
