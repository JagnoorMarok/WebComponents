import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import "./ascii-ripple.css";

const DEFAULT_TEXT =
  "Low tide leaves the rock shelf glazed and quiet, and the pools that remain are small enough to hold in one long look. A shrimp no bigger than a comma drifts above the sand, its shadow arriving a moment before it does. The surface is a second sky. Cloud passes through it, then a gull, then the tremble of my own breath as I lean too close. Nothing here is still, only slow. Anemones open with the patience of clocks. Weed lifts and settles as though the water were remembering a wave it once carried farther up the shore. When a drop falls from my sleeve the whole pool answers at once, rings running outward until they meet the stone and come back folded over themselves, smaller, quieter, braided into a pattern that was never quite round. Light bends through the moving glass and the sand below it wavers, letters on a page read through tears. I count the returns. Four, five, then the surface forgets and the sky is whole again. Farther out the real sea keeps its own time, heavy and unhurried, sending the same news up the channel it has always sent. The pool listens. It repeats every word in a smaller voice, and then, when it is sure no one is watching, it goes back to being a mirror.";

const DEFAULT_CHARS = "·.,:;-~=+*%#@";
const SIM_DT = 1 / 90;

const hashCoords = (x, y, seed) => {
  const n = 43758.5453 * Math.sin(127.1 * x + 311.7 * y + 74.7 * seed);
  return n - Math.floor(n);
};

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

const parseCssColor = (colorStr) => {
  if (typeof document === "undefined") return [255, 255, 255, 1];
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 1;
  const ctx = canvas.getContext("2d");
  if (!ctx) return [255, 255, 255, 1];
  ctx.fillStyle = colorStr;
  ctx.fillRect(0, 0, 1, 1);
  const data = ctx.getImageData(0, 0, 1, 1).data;
  return [data[0], data[1], data[2], data[3] / 255];
};

const interpolateColor = (c1, c2, t) => {
  const r = Math.round(c1[0] + (c2[0] - c1[0]) * t);
  const g = Math.round(c1[1] + (c2[1] - c1[1]) * t);
  const b = Math.round(c1[2] + (c2[2] - c1[2]) * t);
  const a = (c1[3] + (c2[3] - c1[3]) * t).toFixed(3);
  return `rgba(${r},${g},${b},${a})`;
};

const stepSimulation = (sim, waveSpeed, viscosity, damping, edges) => {
  const { w, h, prev, cur, next, mask } = sim;
  const dampingFactor = 1 - damping;
  const propagation = waveSpeed + viscosity;
  let maxEnergy = 0;

  for (let y = 1; y < h - 1; y++) {
    const rowOffset = y * w;
    for (let x = 1; x < w - 1; x++) {
      const idx = rowOffset + x;
      const c = cur[idx];
      const laplacian =
        cur[idx - 1] + cur[idx + 1] + cur[idx - w] + cur[idx + w] - 4 * c;
      const val =
        0.996 * c +
        (c - prev[idx]) * dampingFactor * mask[idx] +
        propagation * laplacian;

      next[idx] = val;
      const absVal = val < 0 ? -val : val;
      if (absVal > maxEnergy) {
        maxEnergy = absVal;
      }
    }
  }

  if (edges === "reflect") {
    for (let x = 0; x < w; x++) {
      next[x] = next[x + w];
      next[(h - 1) * w + x] = next[(h - 2) * w + x];
    }
    for (let y = 0; y < h; y++) {
      next[y * w] = next[y * w + 1];
      next[y * w + w - 1] = next[y * w + w - 2];
    }
  }

  sim.prev = cur;
  sim.cur = next;
  sim.next = prev;
  sim.energy = maxEnergy;
};

const clearSimulation = (sim) => {
  sim.cur.fill(0);
  sim.prev.fill(0);
  sim.next.fill(0);
  sim.energy = 0;
};

const addImpulse = (sim, px, py, radius, strength) => {
  const cx = px / sim.cell + 1;
  const cy = py / sim.cell + 1;
  const rCells = Math.max(1, radius / sim.cell);
  const minX = Math.max(1, Math.floor(cx - rCells));
  const maxX = Math.min(sim.w - 2, Math.ceil(cx + rCells));
  const minY = Math.max(1, Math.floor(cy - rCells));
  const maxY = Math.min(sim.h - 2, Math.ceil(cy + rCells));
  const invR2 = 1 / (rCells * rCells);

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const s = 1 - (dx * dx + dy * dy) * invR2;
      if (s > 0) {
        sim.cur[y * sim.w + x] -= strength * s * s * (3 - 2 * s);
      }
    }
  }

  if (sim.energy < strength) {
    sim.energy = strength;
  }
};

const sampleField = (sim, px, py, out) => {
  const gx = px / sim.cell + 1;
  const gy = py / sim.cell + 1;
  const ix = Math.min(sim.w - 3, Math.max(1, Math.floor(gx)));
  const iy = Math.min(sim.h - 3, Math.max(1, Math.floor(gy)));
  const fx = clamp01(gx - ix);
  const fy = clamp01(gy - iy);
  const { w, cur } = sim;
  const idx = iy * w + ix;

  const top = cur[idx] + (cur[idx + 1] - cur[idx]) * fx;
  const bottom = cur[idx + w] + (cur[idx + w + 1] - cur[idx + w]) * fx;
  out[0] = top + (bottom - top) * fy;

  const dxTop = cur[idx + 1] - cur[idx - 1];
  const dxBottom = cur[idx + w + 1] - cur[idx + w - 1];
  out[1] = (dxTop + (dxBottom - dxTop) * fy) * 0.5;

  const dyLeft = cur[idx + w] - cur[idx - w];
  const dyRight = cur[idx + w + 1] - cur[idx - w + 1];
  out[2] = (dyLeft + (dyRight - dyLeft) * fx) * 0.5;
};

export const AsciiRipple = forwardRef(function AsciiRipple(
  {
    text = DEFAULT_TEXT,
    chars = DEFAULT_CHARS,
    fontSize = 16,
    lineHeight = 1.2,
    fontFamily = 'ui-monospace, "JetBrains Mono", Menlo, Consolas, monospace',
    fontWeight = 400,
    textColor = "#f5f5f4",
    rippleColor = "#ffffff",
    troughColor = "#ad57ff",
    backgroundColor = "transparent",
    textOpacity = 0.15,
    resolution = 3,
    speed = 0.55,
    damping = 0.045,
    viscosity = 0.4,
    edges = "absorb",
    dropStrength = 1.2,
    dropRadius = 26,
    dragStrength = 0.3,
    dragRadius = 16,
    rain = 0,
    rainStrength = 0.6,
    sensitivity = 2.2,
    slopeGain = 1,
    refraction = 4,
    scramble = 1,
    scrambleSpeed = 90,
    dither = 0.5,
    vignette = 0.6,
    interactive = true,
    className = "",
    style = {},
    ...restProps
  },
  ref
) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const layoutRef = useRef(null);
  const simRef = useRef(null);
  const animFrameRef = useRef(0);
  const isRunningRef = useRef(false);
  const lastTimeRef = useRef(0);
  const accumTimeRef = useRef(0);
  const rainAccumRef = useRef(0);
  const sampleOutRef = useRef(new Float32Array(3));
  const reducedMotionRef = useRef(false);
  const tickCallbackRef = useRef(() => {});

  const pointerStateRef = useRef({
    x: 0,
    y: 0,
    lastX: 0,
    lastY: 0,
    inside: false,
    pending: false,
  });

  const fontString = `${fontWeight} ${fontSize}px ${fontFamily}`;

  const colorRamps = useMemo(() => {
    const cBase = parseCssColor(textColor);
    const cUp = parseCssColor(rippleColor);
    const cDown = parseCssColor(troughColor);
    const up = [];
    const down = [];

    for (let i = 0; i <= 24; i++) {
      const t = i / 24;
      up.push(interpolateColor(cBase, cUp, t));
      down.push(interpolateColor(cBase, cDown, t));
    }

    return { up, down };
  }, [textColor, rippleColor, troughColor]);

  const config = {
    chars,
    font: fontString,
    speed,
    damping,
    viscosity,
    edges,
    dropStrength,
    dropRadius,
    dragStrength,
    dragRadius,
    rain,
    rainStrength,
    sensitivity,
    slopeGain,
    refraction,
    scramble,
    scrambleSpeed,
    dither,
    vignette,
    textOpacity,
    resolution,
    interactive,
    backgroundColor,
    ramps: colorRamps,
  };

  const configRef = useRef(config);
  useEffect(() => {
    configRef.current = config;
  });

  const renderFrame = useCallback((now) => {
    const canvas = canvasRef.current;
    const layout = layoutRef.current;
    const sim = simRef.current;
    if (!canvas || !layout || !sim) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cfg = configRef.current;
    const { cols, rows, charW, lineH, base } = layout;
    const clientW = canvas.clientWidth;
    const clientH = canvas.clientHeight;
    const scale = canvas.width / Math.max(1, clientW);

    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, clientW, clientH);
    ctx.font = cfg.font;
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";

    const glyphList = cfg.chars.length ? cfg.chars : DEFAULT_CHARS;
    const numGlyphs = glyphList.length;
    const hasWaves = sim.energy > 0.0015;
    const scrambleTick = Math.floor(now / Math.max(16, cfg.scrambleSpeed));
    const sampleVec = sampleOutRef.current;
    const res = cfg.resolution;
    const disturbedItems = [];

    ctx.globalAlpha = cfg.textOpacity;
    ctx.fillStyle = cfg.ramps.up[0];

    for (let r = 0; r < rows; r++) {
      const rowChars = base[r];
      const yPos = r * lineH + lineH / 2;
      let restingText = "";

      if (hasWaves) {
        for (let c = 0; c < cols; c++) {
          sampleField(sim, c * charW + charW / 2, yPos, sampleVec);
          const height = sampleVec[0];
          const gradX = sampleVec[1] * res;
          const gradY = sampleVec[2] * res;
          const slopeMag = Math.sqrt(gradX * gradX + gradY * gradY);
          const intensity = clamp01(
            (Math.abs(height) * cfg.sensitivity + slopeMag * cfg.slopeGain - 0.12) *
              1.14
          );

          if (intensity < 0.02) {
            restingText += rowChars[c];
            continue;
          }

          const refrC = Math.min(
            cols - 1,
            Math.max(0, Math.round(c + gradX * cfg.refraction * 2))
          );
          const refrR = Math.min(
            rows - 1,
            Math.max(0, Math.round(r + gradY * cfg.refraction))
          );
          let ch = base[refrR][refrC];

          const ditherThreshold =
            0.5 + (hashCoords(c, r, 0) - 0.5) * cfg.dither;
          if (intensity * cfg.scramble >= ditherThreshold) {
            const jitter =
              (hashCoords(c, r, scrambleTick) - 0.5) * numGlyphs * 0.3;
            const glyphIdx = Math.max(
              0,
              Math.min(
                numGlyphs - 1,
                Math.round(intensity * (numGlyphs - 1) + jitter)
              )
            );
            ch = glyphList[glyphIdx];
          }

          if (ch === " ") {
            restingText += " ";
            continue;
          }

          const activeRamp = height >= 0 ? cfg.ramps.up : cfg.ramps.down;
          disturbedItems.push({
            x: c * charW,
            y: yPos,
            ch,
            color: activeRamp[Math.round(24 * intensity)],
          });
          restingText += " ";
        }
      } else {
        restingText = rowChars.join("");
      }

      ctx.fillText(restingText, 0, yPos);
    }

    if (disturbedItems.length) {
      ctx.globalAlpha = 1;
      let curColor = "";
      for (let i = 0; i < disturbedItems.length; i++) {
        const item = disturbedItems[i];
        if (item.color !== curColor) {
          ctx.fillStyle = item.color;
          curColor = item.color;
        }
        ctx.fillText(item.ch, item.x, item.y);
      }
    }

    ctx.globalAlpha = 1;
    if (cfg.vignette > 0) {
      const vDist = clamp01(cfg.vignette) * (Math.min(clientW, clientH) / 2);
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";

      const drawVignetteEdge = (x0, y0, x1, y1) => {
        const grad = ctx.createLinearGradient(x0, y0, x1, y1);
        grad.addColorStop(0, "rgba(0,0,0,1)");
        grad.addColorStop(0.3, "rgba(0,0,0,0.6)");
        grad.addColorStop(0.7, "rgba(0,0,0,0.15)");
        grad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, clientW, clientH);
      };

      drawVignetteEdge(0, 0, vDist, 0);
      drawVignetteEdge(clientW, 0, clientW - vDist, 0);
      drawVignetteEdge(0, 0, 0, vDist);
      drawVignetteEdge(0, clientH, 0, clientH - vDist);
      ctx.restore();
    }

    if (cfg.backgroundColor && cfg.backgroundColor !== "transparent") {
      ctx.globalCompositeOperation = "destination-over";
      ctx.fillStyle = cfg.backgroundColor;
      ctx.fillRect(0, 0, clientW, clientH);
      ctx.globalCompositeOperation = "source-over";
    }
  }, []);

  const stopAnimation = useCallback(() => {
    isRunningRef.current = false;
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = 0;
    }
  }, []);

  const onTick = useCallback(
    (now) => {
      const sim = simRef.current;
      const layout = layoutRef.current;
      if (!sim || !layout) {
        isRunningRef.current = false;
        return;
      }

      const cfg = configRef.current;
      const dt = Math.min(0.1, (now - lastTimeRef.current) / 1000 || 0);
      lastTimeRef.current = now;

      const ptr = pointerStateRef.current;
      if (ptr.pending && cfg.interactive && cfg.dragStrength > 0) {
        const dx = ptr.x - ptr.lastX;
        const dy = ptr.y - ptr.lastY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0.5) {
          const steps = Math.min(
            6,
            Math.max(1, Math.ceil(dist / cfg.dragRadius))
          );
          const strength =
            (cfg.dragStrength * Math.min(1, dist / (1.5 * cfg.dragRadius))) /
            steps;
          for (let s = 1; s <= steps; s++) {
            const ratio = s / steps;
            addImpulse(
              sim,
              ptr.lastX + dx * ratio,
              ptr.lastY + dy * ratio,
              cfg.dragRadius,
              strength
            );
          }
        }
        ptr.lastX = ptr.x;
        ptr.lastY = ptr.y;
        ptr.pending = false;
      }

      const allowRain = cfg.rain > 0 && !(ptr.inside && cfg.interactive);
      if (allowRain) {
        rainAccumRef.current += dt * cfg.rain;
        while (rainAccumRef.current >= 1) {
          rainAccumRef.current -= 1;
          addImpulse(
            sim,
            Math.random() * layout.cols * layout.charW,
            Math.random() * layout.rows * layout.lineH,
            cfg.dropRadius * (0.6 + 0.6 * Math.random()),
            cfg.rainStrength * (0.6 + 0.8 * Math.random())
          );
        }
      } else {
        rainAccumRef.current = 0;
      }

      const waveSpeed = 0.02 + 0.4 * clamp01(cfg.speed);
      const waveViscosity = Math.min(
        0.49 - waveSpeed,
        0.12 * clamp01(cfg.viscosity)
      );
      const waveDamping = Math.min(0.5, Math.max(0, cfg.damping));

      accumTimeRef.current += dt;
      let substeps = 0;
      while (accumTimeRef.current >= SIM_DT && substeps < 4) {
        stepSimulation(
          sim,
          waveSpeed,
          waveViscosity,
          waveDamping,
          cfg.edges
        );
        accumTimeRef.current -= SIM_DT;
        substeps++;
      }

      if (substeps === 4) {
        accumTimeRef.current = 0;
      }

      if (sim.energy < 0.0015 && !allowRain) {
        clearSimulation(sim);
        renderFrame(now);
        isRunningRef.current = false;
        animFrameRef.current = 0;
        return;
      }

      renderFrame(now);
      animFrameRef.current = requestAnimationFrame((t) => tickCallbackRef.current(t));
    },
    [renderFrame]
  );

  useEffect(() => {
    tickCallbackRef.current = onTick;
  }, [onTick]);

  const startAnimation = useCallback(() => {
    if (isRunningRef.current || reducedMotionRef.current) return;
    isRunningRef.current = true;
    lastTimeRef.current = performance.now();
    accumTimeRef.current = 0;
    animFrameRef.current = requestAnimationFrame((t) => tickCallbackRef.current(t));
  }, []);

  const updateDimensions = useCallback(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const rect = container.getBoundingClientRect();
    const clientW = Math.max(1, rect.width);
    const clientH = Math.max(1, rect.height);
    const dpr = Math.min(2, (typeof window !== "undefined" && window.devicePixelRatio) || 1);

    canvas.width = Math.round(clientW * dpr);
    canvas.height = Math.round(clientH * dpr);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.font = fontString;
    const charW = ctx.measureText("M").width || 0.6 * fontSize;
    const lineH = fontSize * lineHeight;

    const cols = Math.max(1, Math.ceil(clientW / charW));
    const rows = Math.max(1, Math.ceil(clientH / lineH));
    const words = text.split(/\s+/).filter(Boolean);
    const baseGrid = [];
    let wordIdx = 0;

    for (let r = 0; r < rows; r++) {
      let lineStr = "";
      while (lineStr.length < cols && words.length) {
        if (lineStr.length > 0) lineStr += " ";
        lineStr += words[wordIdx % words.length];
        wordIdx++;
      }
      baseGrid.push(lineStr.padEnd(cols, " ").slice(0, cols).split(""));
    }

    layoutRef.current = {
      cols,
      rows,
      charW,
      lineH,
      base: baseGrid,
    };

    const simCell = lineH / Math.max(1, Math.min(4, resolution));
    const simW = Math.max(4, Math.ceil(clientW / simCell) + 2);
    const simH = Math.max(4, Math.ceil(clientH / simCell) + 2);
    const simLength = simW * simH;
    const absorbMask = new Float32Array(simLength);
    const absorbDepth =
      edges === "absorb"
        ? Math.max(3, Math.round(0.08 * Math.min(simW, simH)))
        : 0;

    for (let y = 0; y < simH; y++) {
      for (let x = 0; x < simW; x++) {
        let maskVal = 1;
        if (absorbDepth > 0) {
          const edgeDist = Math.min(x, y, simW - 1 - x, simH - 1 - y);
          if (edgeDist < absorbDepth) {
            const frac = edgeDist / absorbDepth;
            maskVal = 1 - (1 - frac) * (1 - frac) * 0.22;
          }
        }
        absorbMask[y * simW + x] = maskVal;
      }
    }

    simRef.current = {
      w: simW,
      h: simH,
      cell: simCell,
      prev: new Float32Array(simLength),
      cur: new Float32Array(simLength),
      next: new Float32Array(simLength),
      mask: absorbMask,
      energy: 0,
    };

    renderFrame(performance.now());
    if (rain > 0) {
      startAnimation();
    }
  }, [
    fontString,
    fontSize,
    lineHeight,
    text,
    resolution,
    edges,
    rain,
    renderFrame,
    startAnimation,
  ]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const checkMotion = () => {
      reducedMotionRef.current = media.matches;
      if (media.matches) {
        stopAnimation();
        const sim = simRef.current;
        if (sim) clearSimulation(sim);
        renderFrame(performance.now());
      }
    };

    checkMotion();
    media.addEventListener("change", checkMotion);
    return () => media.removeEventListener("change", checkMotion);
  }, [renderFrame, stopAnimation]);

  useEffect(() => {
    let cancelled = false;
    const fontReadyPromise =
      typeof document !== "undefined" && document.fonts?.ready
        ? Promise.race([
            document.fonts.ready,
            new Promise((res) => setTimeout(res, 1500)),
          ])
        : Promise.resolve();

    fontReadyPromise.then(() => {
      if (!cancelled) updateDimensions();
    });

    const el = containerRef.current;
    const ro = new ResizeObserver(() => updateDimensions());
    if (el) ro.observe(el);

    return () => {
      cancelled = true;
      ro.disconnect();
    };
  }, [updateDimensions]);

  useEffect(() => {
    renderFrame(performance.now());
  }, [colorRamps, chars, textOpacity, vignette, backgroundColor, renderFrame]);

  useEffect(() => {
    return () => stopAnimation();
  }, [stopAnimation]);

  const getPointerPos = (e) => {
    const el = containerRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  useImperativeHandle(
    ref,
    () => ({
      drop: (x, y, strength = dropStrength, radius = dropRadius) => {
        const sim = simRef.current;
        if (sim && !reducedMotionRef.current) {
          addImpulse(sim, x, y, radius, strength);
          startAnimation();
        }
      },
      calm: () => {
        const sim = simRef.current;
        if (sim) {
          clearSimulation(sim);
          renderFrame(performance.now());
        }
      },
    }),
    [dropStrength, dropRadius, startAnimation, renderFrame]
  );

  return (
    <div
      ref={containerRef}
      className={`ascii-ripple-container ${className}`.trim()}
      style={style}
      onPointerMove={(e) => {
        if (!interactive || reducedMotionRef.current) return;
        const pos = getPointerPos(e);
        if (!pos) return;
        const ptr = pointerStateRef.current;
        if (!ptr.inside) {
          ptr.lastX = pos.x;
          ptr.lastY = pos.y;
          ptr.inside = true;
        }
        ptr.x = pos.x;
        ptr.y = pos.y;
        ptr.pending = true;
        startAnimation();
      }}
      onPointerLeave={() => {
        const ptr = pointerStateRef.current;
        ptr.inside = false;
        ptr.pending = false;
        if (rain > 0) startAnimation();
      }}
      onPointerDown={(e) => {
        if (!interactive || reducedMotionRef.current) return;
        const pos = getPointerPos(e);
        const sim = simRef.current;
        if (!pos || !sim) return;
        addImpulse(sim, pos.x, pos.y, dropRadius, dropStrength);
        const ptr = pointerStateRef.current;
        ptr.x = ptr.lastX = pos.x;
        ptr.y = ptr.lastY = pos.y;
        ptr.inside = true;
        startAnimation();
      }}
      {...restProps}
    >
      <canvas
        ref={canvasRef}
        className="ascii-ripple-canvas"
        aria-hidden="true"
      />
    </div>
  );
});

AsciiRipple.displayName = "AsciiRipple";

export default AsciiRipple;
