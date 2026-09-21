import React, { useEffect, useRef } from "react";
import "./constellation-field.css";

export function ConstellationField({
  mode = "dark",
  speed = 1,
  size = 1,
  strokeWidth = 1,
  length = 1,
  density = 1,
  opacity = 1,
  hue = 0,
  saturation = 1,
  brightness = 1,
  color,
  interactive = true,
  className = "",
  style = {},
  children,
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);

  // Store latest configuration props in refs to avoid recreating the animation loop
  const propsRef = useRef({
    speed,
    size,
    strokeWidth,
    length,
    density,
    opacity,
    mode,
    color,
    interactive,
  });

  useEffect(() => {
    propsRef.current = {
      speed,
      size,
      strokeWidth,
      length,
      density,
      opacity,
      mode,
      color,
      interactive,
    };
  }, [speed, size, strokeWidth, length, density, opacity, mode, color, interactive]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let nodes = [];
    const pointer = {
      x: -2000,
      y: -2000,
      targetX: -2000,
      targetY: -2000,
      active: false,
    };

    const getBaseNodeCount = (w, d) => {
      const base = w < 768 ? 45 : 95;
      return Math.max(10, Math.round(base * d));
    };

    const initNodes = () => {
      if (width === 0 || height === 0) return;
      const count = getBaseNodeCount(width, propsRef.current.density);
      nodes = [];
      for (let i = 0; i < count; i++) {
        const baseSpeed = Math.random() * 0.4 + 0.15;
        const angle = Math.random() * Math.PI * 2;
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: Math.cos(angle) * baseSpeed,
          vy: Math.sin(angle) * baseSpeed,
          baseRadius: Math.random() * 2.2 + 1.6,
          phase: Math.random() * Math.PI * 2,
        });
      }
    };

    const handleResize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.floor(rect.width);
      height = Math.floor(rect.height);

      if (width === 0 || height === 0) return;

      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = false;

      initNodes();
    };

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);
    handleResize();

    // Responsive Pointer Event Handlers
    const updatePointer = (clientX, clientY) => {
      if (!propsRef.current.interactive) return;
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      if (clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom) {
        pointer.targetX = x;
        pointer.targetY = y;
        if (!pointer.active) {
          pointer.x = x;
          pointer.y = y;
          pointer.active = true;
        }
      } else {
        pointer.active = false;
        pointer.targetX = -2000;
        pointer.targetY = -2000;
      }
    };

    const onPointerMove = (e) => {
      updatePointer(e.clientX, e.clientY);
    };

    const onPointerLeave = () => {
      pointer.active = false;
      pointer.targetX = -2000;
      pointer.targetY = -2000;
    };

    const onPointerDown = (e) => {
      if (!propsRef.current.interactive) return;
      const rect = canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;

      // Cosmic Shockwave: Push nearby nodes outward on click/tap
      for (let i = 0; i < nodes.length; i++) {
        const d = Math.hypot(nodes[i].x - px, nodes[i].y - py);
        if (d < 280 && d > 1) {
          const angle = Math.atan2(nodes[i].y - py, nodes[i].x - px);
          const push = (1 - d / 280) * 5;
          nodes[i].vx += Math.cos(angle) * push;
          nodes[i].vy += Math.sin(angle) * push;
        }
      }
    };

    // Global window move listener ensures mouse movement is never lost even if fast
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerleave", onPointerLeave);
    canvas.addEventListener("pointerdown", onPointerDown);

    const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

    let lastTime = performance.now();

    // Render loop
    const render = (time) => {
      const dt = Math.min(32, time - lastTime) / 16.666;
      lastTime = time;

      if (width > 0 && height > 0) {
        ctx.clearRect(0, 0, width, height);
        ctx.lineCap = "butt";
        ctx.lineJoin = "miter";

        // Smooth pointer interpolation
        if (pointer.active) {
          pointer.x += (pointer.targetX - pointer.x) * 0.25;
          pointer.y += (pointer.targetY - pointer.y) * 0.25;
        } else {
          pointer.x = -2000;
          pointer.y = -2000;
        }

        const {
          speed: currentSpeed,
          size: currentSize,
          strokeWidth: currentStrokeWidth,
          length: currentLength,
          opacity: currentOpacity,
          mode: currentMode,
          color: customColor,
        } = propsRef.current;

        const effectiveLink = Math.round(160 * currentLength);
        const effectiveStroke = Math.max(0.25, currentStrokeWidth);

        // Colors: Warm Pale Gold #E6C879 for dark, Bronze Ochre #8B6914 for light
        const themeColor =
          customColor || (currentMode === "light" ? "#8B6914" : "#E6C879");

        ctx.strokeStyle = themeColor;
        ctx.fillStyle = themeColor;
        ctx.lineWidth = effectiveStroke;

        const len = nodes.length;

        // 1. Draw Links between adjacent nodes
        for (let i = 0; i < len; i++) {
          for (let j = i + 1; j < len; j++) {
            const d = dist(nodes[i], nodes[j]);
            if (d < effectiveLink) {
              const alpha = (0.2 + (1 - d / effectiveLink) * 0.6) * currentOpacity;
              ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
              ctx.beginPath();
              ctx.moveTo(nodes[i].x, nodes[i].y);
              ctx.lineTo(nodes[j].x, nodes[j].y);
              ctx.stroke();
            }
          }

          // 2. Draw Interactive Constellation Links to the Mouse Pointer!
          if (pointer.active) {
            const dp = dist(nodes[i], pointer);
            const pointerLinkDist = effectiveLink * 1.35;
            if (dp < pointerLinkDist) {
              const pAlpha = (1 - dp / pointerLinkDist) * 0.85 * currentOpacity;
              ctx.globalAlpha = Math.max(0, Math.min(1, pAlpha));
              ctx.lineWidth = effectiveStroke * 1.25;
              ctx.beginPath();
              ctx.moveTo(nodes[i].x, nodes[i].y);
              ctx.lineTo(pointer.x, pointer.y);
              ctx.stroke();
              ctx.lineWidth = effectiveStroke;
            }
          }
        }

        // 3. Update Physics and Draw Celestial Nodes
        const now = time * 0.001;
        const gravityRadius = 240;

        for (let i = 0; i < len; i++) {
          const node = nodes[i];

          // Move with velocity
          node.x += node.vx * currentSpeed * dt;
          node.y += node.vy * currentSpeed * dt;

          // Bounce off screen boundaries
          if (node.x < 0) {
            node.x = 0;
            node.vx = Math.abs(node.vx);
          } else if (node.x > width) {
            node.x = width;
            node.vx = -Math.abs(node.vx);
          }

          if (node.y < 0) {
            node.y = 0;
            node.vy = Math.abs(node.vy);
          } else if (node.y > height) {
            node.y = height;
            node.vy = -Math.abs(node.vy);
          }

          // Gentle velocity dampening so shockwaves stabilize smoothly
          node.vx *= 0.995;
          node.vy *= 0.995;

          // Interactive Pointer Attraction Gravity
          let nodeRadiusMultiplier = 1;
          if (pointer.active) {
            const pd = dist(node, pointer);
            if (pd < gravityRadius && pd > 1) {
              const pullFactor = (1 - pd / gravityRadius) * 0.035 * dt;
              node.x -= (node.x - pointer.x) * pullFactor;
              node.y -= (node.y - pointer.y) * pullFactor;

              // Enlarge slightly when near the cursor
              nodeRadiusMultiplier = 1 + (1 - pd / gravityRadius) * 0.65;
            }
          }

          // Celestial pulse
          const pulse = 0.75 + Math.sin(now * 1.5 + node.phase + node.x * 0.01) * 0.25;
          const nodeRadius = node.baseRadius * currentSize * nodeRadiusMultiplier;

          // Soft outer glowing halo
          ctx.globalAlpha = pulse * 0.32 * currentOpacity;
          ctx.beginPath();
          ctx.arc(node.x, node.y, nodeRadius * 2.5, 0, Math.PI * 2);
          ctx.fill();

          // Sharp starlight core
          ctx.globalAlpha = pulse * currentOpacity;
          ctx.beginPath();
          ctx.arc(node.x, node.y, nodeRadius, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw luminous pointer anchor if cursor is active inside canvas
        if (pointer.active) {
          ctx.fillStyle = themeColor;
          ctx.globalAlpha = 0.35 * currentOpacity;
          ctx.beginPath();
          ctx.arc(pointer.x, pointer.y, 8 * currentSize, 0, Math.PI * 2);
          ctx.fill();

          ctx.globalAlpha = 0.85 * currentOpacity;
          ctx.beginPath();
          ctx.arc(pointer.x, pointer.y, 2.5 * currentSize, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.globalAlpha = 1;
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
      canvas.removeEventListener("pointerdown", onPointerDown);
    };
  }, []);

  const filterString =
    hue !== 0 || saturation !== 1 || brightness !== 1
      ? `hue-rotate(${hue}deg) saturate(${saturation}) brightness(${brightness})`
      : undefined;

  const isDark = mode !== "light";

  return (
    <div
      ref={containerRef}
      className={`cf-root ${isDark ? "cf-dark" : "cf-light"} ${className}`}
      style={style}
    >
      {/* Background Gradients */}
      <div className="cf-bg-gradient" />
      <div className="cf-vignette" />

      {/* Constellation Canvas */}
      <canvas
        ref={canvasRef}
        className="cf-canvas"
        style={{
          filter: filterString,
        }}
      />

      {/* Children elements (pointer-events: none is handled by child container) */}
      {children}
    </div>
  );
}

export default ConstellationField;
