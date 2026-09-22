import React, { useRef, useEffect, useCallback } from 'react';

/**
 * GlitchText — Canvas-based interactive text with cursor-reactive sticky glitch effect.
 *
 * How it works:
 * 1. Splits text into individual glyph shards, measures each width with measureText().
 * 2. On cursor proximity, RGB-split ghost copies are drawn with additive compositing.
 * 3. A sticky hold timer keeps the glitch alive after the cursor leaves.
 * 4. Scanline bars sweep over active glyphs for CRT artifact simulation.
 */
const GlitchText = ({
  text = 'GLITCH',
  fontSize = 120,
  fontFamily = 'monospace',
  color = '#ffffff',
  glitchColor1 = '#ff003c',
  glitchColor2 = '#00f5ff',
  cursorRadius = 180,
  glitchIntensity = 28,
  stickyFrames = 22,
  scanlineOpacity = 0.18,
  letterSpacing = 0.06,
  className = '',
  style = {},
}) => {
  const canvasRef = useRef(null);
  const stateRef = useRef({
    mouse: { x: -9999, y: -9999 },
    glyphShards: [],
    frame: 0,
    animId: null,
    W: 800,
    H: 200,
  });

  const buildShards = useCallback((W, H, font) => {
    const chars = text.split('');
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = W;
    tempCanvas.height = H;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.font = font;
    tempCtx.textBaseline = 'middle';

    const spacing = fontSize * letterSpacing;
    let totalWidth = 0;
    const widths = chars.map((ch) => {
      const w = tempCtx.measureText(ch).width + spacing;
      totalWidth += w;
      return w;
    });

    const startX = W / 2 - totalWidth / 2;
    const centreY = H / 2;

    let x = startX;
    return chars.map((ch, i) => {
      const w = widths[i];
      const shard = {
        ch,
        x: x + w / 2,
        y: centreY,
        w,
        glitchTimer: 0,
        glitchX1: 0,
        glitchX2: 0,
        scanY: Math.random() * fontSize,
        active: false,
      };
      x += w;
      return shard;
    });
  }, [text, fontSize, letterSpacing]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const font = `bold ${fontSize}px ${fontFamily}`;
    const state = stateRef.current;

    // Measure dimensions — fall back to window width if parent not laid out yet
    const getW = () => {
      const p = canvas.parentElement;
      return (p && p.offsetWidth > 0 ? p.offsetWidth : window.innerWidth) || 800;
    };
    const getH = () => Math.max(fontSize * 2.2, 200);

    const resize = () => {
      const W = getW();
      const H = getH();
      state.W = W;
      state.H = H;
      // Reset transform before re-scaling to avoid compounding
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      const ctx = canvas.getContext('2d');
      ctx.setTransform(1, 0, 0, 1, 0, 0);   // reset
      ctx.scale(dpr, dpr);
      state.glyphShards = buildShards(W, H, font);
    };

    resize();

    const ctx = canvas.getContext('2d');

    // ── Render loop ─────────────────────────────────────────────────────────
    const draw = () => {
      const { W, H, mouse, glyphShards } = state;
      ctx.clearRect(0, 0, W, H);

      glyphShards.forEach((shard) => {
        const dx = mouse.x - shard.x;
        const dy = mouse.y - shard.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < cursorRadius) {
          shard.glitchTimer = stickyFrames;
          shard.active = true;
        } else if (shard.glitchTimer > 0) {
          shard.glitchTimer--;
          if (shard.glitchTimer === 0) shard.active = false;
        }

        const isGlitching = shard.active || shard.glitchTimer > 0;

        if (isGlitching) {
          const jitter = glitchIntensity * (0.4 + 0.6 * Math.random());
          shard.glitchX1 = (Math.random() < 0.5 ? -1 : 1) * jitter;
          shard.glitchX2 = -shard.glitchX1 * (0.5 + 0.5 * Math.random());
          shard.scanY = (shard.scanY + 3 + Math.random() * 4) % (H * 0.9);

          // Red ghost
          ctx.save();
          ctx.globalAlpha = 0.7 + Math.random() * 0.2;
          ctx.globalCompositeOperation = 'lighter';
          ctx.fillStyle = glitchColor1;
          ctx.font = font;
          ctx.textBaseline = 'middle';
          ctx.fillText(shard.ch, shard.x - shard.w / 2 + shard.glitchX1, shard.y);
          ctx.restore();

          // Cyan ghost
          ctx.save();
          ctx.globalAlpha = 0.7 + Math.random() * 0.2;
          ctx.globalCompositeOperation = 'lighter';
          ctx.fillStyle = glitchColor2;
          ctx.font = font;
          ctx.textBaseline = 'middle';
          ctx.fillText(shard.ch, shard.x - shard.w / 2 + shard.glitchX2, shard.y);
          ctx.restore();

          // Scanline bar
          const barH = Math.random() < 0.4 ? fontSize * 0.12 : fontSize * 0.06;
          const barY = shard.y - fontSize * 0.7 + shard.scanY;
          ctx.save();
          ctx.globalAlpha = scanlineOpacity;
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(shard.x - shard.w * 0.5, barY, shard.w, barH);
          ctx.restore();
        }

        // Base text (drawn on top)
        const shakeX = isGlitching ? (Math.random() - 0.5) * 2.5 : 0;
        const shakeY = isGlitching ? (Math.random() - 0.5) * 1.5 : 0;
        ctx.save();
        ctx.globalAlpha = 1;
        ctx.fillStyle = color;
        ctx.font = font;
        ctx.textBaseline = 'middle';
        ctx.fillText(shard.ch, shard.x - shard.w / 2 + shakeX, shard.y + shakeY);
        ctx.restore();
      });

      state.animId = requestAnimationFrame(draw);
    };

    draw();

    // ── Mouse tracking ──────────────────────────────────────────────────────
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      state.mouse.x = e.clientX - rect.left;
      state.mouse.y = e.clientY - rect.top;
    };
    const handleMouseLeave = () => {
      state.mouse.x = -9999;
      state.mouse.y = -9999;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(state.animId);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', resize);
    };
  }, [text, fontSize, fontFamily, color, glitchColor1, glitchColor2, cursorRadius,
      glitchIntensity, stickyFrames, scanlineOpacity, buildShards]);

  return (
    <canvas
      ref={canvasRef}
      className={`glitch-text-canvas ${className}`}
      style={{ display: 'block', cursor: 'crosshair', ...style }}
    />
  );
};

export default GlitchText;
