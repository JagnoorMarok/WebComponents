import React, { useState, useEffect, useRef, useCallback } from "react";
import "./morph-gallery.css";

// Helper functions for wrapping indices and quintic easing
function wrapIndex(index, length, loop) {
  if (length <= 0) return 0;
  if (loop) {
    return ((index % length) + length) % length;
  }
  return Math.min(Math.max(index, 0), length - 1);
}

function easeInOutQuint(t) {
  const x = Math.min(Math.max(t, 0), 1);
  return x < 0.5 ? 16 * Math.pow(x, 5) : 1 - Math.pow(-2 * x + 2, 5) / 2;
}

// WebGL Vertex Shader
const VERTEX_SHADER = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

// WebGL Fragment Shader with Simplex Noise & FBM
const FRAGMENT_SHADER = `
precision highp float;

uniform sampler2D u_from;
uniform sampler2D u_to;
uniform float u_progress;
uniform vec2 u_resolution;
uniform float u_fromAspect;
uniform float u_toAspect;
uniform float u_scale;
uniform float u_direction;
uniform float u_edge;
uniform float u_drift;

varying vec2 v_uv;

vec3 permute(vec3 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float snoise(vec2 v) {
  const vec4 C = vec4(
    0.211324865405187,
    0.366025403784439,
   -0.577350269189626,
    0.024390243902439
  );
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(
    permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0)
  );
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x  = 2.0 * fract(p * C.www) - 1.0;
  vec3 h  = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float fbm(vec2 v) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 5; i++) {
    value += amplitude * snoise(v);
    v *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

vec2 mirror(vec2 uv) {
  return 1.0 - abs(1.0 - mod(uv, 2.0));
}

vec2 coverUV(vec2 uv, float imgAspect) {
  float canvasAspect = u_resolution.x / u_resolution.y;
  vec2 scale = (canvasAspect > imgAspect)
    ? vec2(1.0, imgAspect / canvasAspect)
    : vec2(canvasAspect / imgAspect, 1.0);
  return mirror((uv - 0.5) * scale + 0.5);
}

void main() {
  float adjusted = u_progress * (1.0 + 2.0 * u_edge) - u_edge;

  // Compute 5-octave FBM noise field
  float noise = fbm(v_uv * u_scale + vec2(0.0, u_progress * u_direction)) * 0.5 + 0.5;

  // Dynamic luminance threshold burn-through
  noise = smoothstep(
    0.0,
    2.0,
    length(texture2D(u_to, coverUV(v_uv, u_toAspect)).rgb) + noise
  );

  float mixFactor = 1.0 - smoothstep(adjusted - u_edge, adjusted + u_edge, noise);

  // Organic fluid morph displacement warp (peaks at progress = 0.5, zero at 0.0 & 1.0)
  float morphWarp = sin(u_progress * 3.14159265);
  vec2 warpOffset = vec2(
    sin((v_uv.y + noise) * 10.0) * 0.04 * morphWarp,
    cos((v_uv.x + noise) * 10.0) * 0.04 * morphWarp * u_direction
  );

  // Both frames slide with opposing parallax drift + organic morph warp
  vec2 fromUV = coverUV(
    v_uv + vec2(0.0, noise * u_progress * u_drift * u_direction) + warpOffset,
    u_fromAspect
  );
  vec2 toUV = coverUV(
    v_uv + vec2(0.0, noise * (1.0 - u_progress) * -0.5 * u_drift * u_direction) - warpOffset * 0.8,
    u_toAspect
  );

  gl_FragColor = mix(texture2D(u_from, fromUV), texture2D(u_to, toUV), mixFactor);
}
`;

function compileShader(gl, type, source) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Could not create shader");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error("Shader compile failed: " + info);
  }
  return shader;
}

function linkProgram(gl, vsSource, fsSource) {
  const vs = compileShader(gl, gl.VERTEX_SHADER, vsSource);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, fsSource);
  const program = gl.createProgram();
  if (!program) throw new Error("Could not create program");
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error("Program link failed: " + info);
  }
  return program;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (src.startsWith("http://") || src.startsWith("https://")) {
      img.crossOrigin = "anonymous";
    }
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = (e) => {
      console.warn("Failed to load image texture for WebGL:", src);
      reject(new Error("Could not load image: " + src));
    };
    img.src = src;
  });
}

export default function MorphGallery({
  items = [],
  height = "620px",
  duration = 1500,
  noiseScale = 3.5,
  edge = 0.15,
  drift = 0.5,
  loop = true,
  autoplay = 4500,
  arrows = true,
  thumbnails = true,
  index,
  defaultIndex = 0,
  onIndexChange,
  className = "",
}) {
  const canvasRef = useRef(null);
  const [internalIndex, setInternalIndex] = useState(() => wrapIndex(defaultIndex, items.length, loop));
  const currentIndex = index === undefined ? internalIndex : wrapIndex(index, items.length, loop);

  const [hasError, setHasError] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [contextLostCounter, setContextLostCounter] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Check reduced motion preference
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setPrefersReducedMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const changeIndex = useCallback(
    (newIdx) => {
      const wrapped = wrapIndex(newIdx, items.length, loop);
      if (index === undefined) {
        setInternalIndex(wrapped);
      }
      if (onIndexChange) {
        onIndexChange(wrapped);
      }
    },
    [index, items.length, loop, onIndexChange]
  );

  const configRef = useRef({ duration, noiseScale, edge, drift, reduced: prefersReducedMotion });
  configRef.current = { duration, noiseScale, edge, drift, reduced: prefersReducedMotion };

  const transitionRef = useRef(null);
  const prevIndexRef = useRef(currentIndex);

  useEffect(() => {
    if (prevIndexRef.current !== currentIndex) {
      transitionRef.current = { from: prevIndexRef.current, to: currentIndex };
      prevIndexRef.current = currentIndex;
    }
  }, [currentIndex]);

  const sourcesKey = items.map((it) => it.src).join("\n");

  // WebGL Renderer loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || items.length === 0) return;

    const gl =
      canvas.getContext("webgl", { alpha: false, antialias: false }) ||
      canvas.getContext("experimental-webgl");

    if (!gl) {
      setHasError(true);
      return;
    }

    let program = null;
    let buffer = null;
    const textures = items.map(() => null);
    const aspectRatios = items.map(() => 1);
    let animFrameId = 0;
    let isDisposed = false;

    let fromIndex = currentIndex;
    let toIndex = currentIndex;
    let progress = 1.0;
    let startTime = 0;
    let direction = 1.0;

    const onLost = (e) => {
      e.preventDefault();
      cancelAnimationFrame(animFrameId);
    };

    const onRestored = () => {
      setContextLostCounter((c) => c + 1);
    };

    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.round(canvas.clientWidth * dpr);
      const h = Math.round(canvas.clientHeight * dpr);
      if (w === 0 || h === 0) return;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    const uniforms = {};

    const pickTexture = (idx) => textures[idx] || textures.find(Boolean) || null;

    const draw = () => {
      if (isDisposed) return;
      const cfg = configRef.current;
      const trans = transitionRef.current;

      if (trans && trans.from !== trans.to) {
        transitionRef.current = null;
        fromIndex = trans.from;
        toIndex = trans.to;
        progress = 0.0;
        startTime = performance.now();
        const total = items.length;
        direction = (loop ? ((trans.to - trans.from + total) % total) * 2 <= total : trans.to > trans.from) ? 1 : -1;
      }

      if (progress < 1.0) {
        const dur = cfg.reduced ? 0 : Math.max(cfg.duration, 1);
        const elapsed = performance.now() - startTime;
        progress = dur === 0 ? 1.0 : easeInOutQuint(Math.min(elapsed / dur, 1.0));
      }

      const texFrom = pickTexture(fromIndex);
      const texTo = pickTexture(toIndex);

      if (texFrom && texTo) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texFrom);
        gl.uniform1i(uniforms.from, 0);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, texTo);
        gl.uniform1i(uniforms.to, 1);

        gl.uniform1f(uniforms.progress, progress);
        gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
        gl.uniform1f(uniforms.fromAspect, aspectRatios[fromIndex] || 1);
        gl.uniform1f(uniforms.toAspect, aspectRatios[toIndex] || 1);
        gl.uniform1f(uniforms.scale, cfg.noiseScale);
        gl.uniform1f(uniforms.direction, direction);
        gl.uniform1f(uniforms.edge, Math.max(cfg.edge, 0.001));
        gl.uniform1f(uniforms.drift, cfg.drift);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
    };

    const renderLoop = () => {
      draw();
      animFrameId = requestAnimationFrame(renderLoop);
    };

    // Initialize WebGL pipeline and textures
    (async () => {
      try {
        program = linkProgram(gl, VERTEX_SHADER, FRAGMENT_SHADER);
        gl.useProgram(program);

        buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(
          gl.ARRAY_BUFFER,
          new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
          gl.STATIC_DRAW
        );

        const posAttr = gl.getAttribLocation(program, "a_position");
        gl.enableVertexAttribArray(posAttr);
        gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);

        const uniformNames = [
          "from",
          "to",
          "progress",
          "resolution",
          "fromAspect",
          "toAspect",
          "scale",
          "direction",
          "edge",
          "drift",
        ];
        for (const name of uniformNames) {
          uniforms[name] = gl.getUniformLocation(program, "u_" + name);
        }

        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

        let started = false;
        let failCount = 0;

        await Promise.all(
          items.map((item, idx) =>
            loadImage(item.src).then(
              (img) => {
                if (isDisposed) return;
                const tex = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_2D, tex);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

                textures[idx] = tex;
                aspectRatios[idx] = img.naturalWidth / Math.max(img.naturalHeight, 1);

                if (!started) {
                  started = true;
                  resize();
                  setIsReady(true);
                  animFrameId = requestAnimationFrame(renderLoop);
                }
              },
              () => {
                failCount += 1;
                if (failCount === items.length && !isDisposed) {
                  setHasError(true);
                }
              }
            )
          )
        );
      } catch (err) {
        console.error("WebGL initialization failed:", err);
        if (!isDisposed) setHasError(true);
      }
    })();

    return () => {
      isDisposed = true;
      cancelAnimationFrame(animFrameId);
      resizeObserver.disconnect();
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);

      for (const tex of textures) {
        if (tex) gl.deleteTexture(tex);
      }
      if (buffer) gl.deleteBuffer(buffer);
      if (program) gl.deleteProgram(program);
      textures.fill(null);
    };
  }, [sourcesKey, contextLostCounter, items.length, loop]);

  // Autoplay handler
  useEffect(() => {
    if (!autoplay || prefersReducedMotion || isPaused || items.length < 2) return;
    const interval = window.setInterval(() => {
      changeIndex(currentIndex + 1);
    }, Math.max(autoplay, 800));
    return () => window.clearInterval(interval);
  }, [autoplay, prefersReducedMotion, isPaused, currentIndex, changeIndex, items.length]);

  // Handle tab visibility change
  useEffect(() => {
    const handleVisChange = () => setIsPaused(document.hidden);
    document.addEventListener("visibilitychange", handleVisChange);
    return () => document.removeEventListener("visibilitychange", handleVisChange);
  }, []);

  // Swipe / Pointer interaction
  const pointerStartRef = useRef(null);
  const onPointerDown = (e) => {
    pointerStartRef.current = e.clientX;
  };
  const onPointerUp = (e) => {
    const startX = pointerStartRef.current;
    pointerStartRef.current = null;
    if (startX === null) return;
    const delta = e.clientX - startX;
    if (Math.abs(delta) > 48) {
      changeIndex(currentIndex + (delta < 0 ? 1 : -1));
    }
  };

  // Keyboard navigation
  const onKeyDown = (e) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      changeIndex(currentIndex - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      changeIndex(currentIndex + 1);
    }
  };

  const isPrevDisabled = !loop && currentIndex === 0;
  const isNextDisabled = !loop && currentIndex === items.length - 1;
  const currentItem = items[currentIndex];

  return (
    <section
      className={`morph-gallery-root ${className}`}
      style={{ height }}
      role="region"
      aria-roledescription="carousel"
      aria-label="Morph Image Gallery"
      tabIndex={0}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      {/* Fallback image rendering or WebGL Canvas */}
      {hasError ? (
        items.map((item, idx) => (
          <img
            key={item.src}
            src={item.src}
            alt={item.alt || ""}
            className="morph-gallery-fallback-img"
            style={{ opacity: idx === currentIndex ? 1 : 0 }}
            aria-hidden={idx !== currentIndex}
          />
        ))
      ) : (
        <canvas
          ref={canvasRef}
          className="morph-gallery-canvas"
          style={{ opacity: isReady ? 1 : 0, transition: "opacity 400ms ease" }}
          aria-hidden="true"
        />
      )}

      {/* Atmospheric Vignette Gradients */}
      <div className="morph-gallery-gradient-top" aria-hidden="true" />
      <div className="morph-gallery-gradient" aria-hidden="true" />

      {/* Header Overlay */}
      <div className="morph-gallery-header">
        <div className="morph-gallery-tag">
          <span className="morph-gallery-tag-dot" />
          <span>WebGL Noise Morph</span>
        </div>
        <div className="morph-gallery-count">
          {currentIndex + 1} / {items.length}
        </div>
      </div>

      {/* Photo Title Overlay */}
      {currentItem && (
        <div className="morph-gallery-info">
          <h3 className="morph-gallery-title">{currentItem.title || currentItem.alt}</h3>
        </div>
      )}

      {/* Arrow Buttons */}
      {arrows && items.length > 1 && (
        <>
          <button
            type="button"
            className="morph-gallery-arrow prev"
            onClick={() => changeIndex(currentIndex - 1)}
            disabled={isPrevDisabled}
            aria-label="Previous photo"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            type="button"
            className="morph-gallery-arrow next"
            onClick={() => changeIndex(currentIndex + 1)}
            disabled={isNextDisabled}
            aria-label="Next photo"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </>
      )}

      {/* Thumbnail Filmstrip */}
      {thumbnails && items.length > 1 && (
        <ul className="morph-gallery-thumbnails-track" role="tablist" aria-label="Photo thumbnails">
          {items.map((item, idx) => (
            <li key={item.src} className="morph-gallery-thumb-item" role="presentation">
              <button
                type="button"
                role="tab"
                onClick={() => changeIndex(idx)}
                aria-selected={idx === currentIndex}
                aria-label={item.alt ? `Jump to ${item.alt}` : `Jump to photo ${idx + 1}`}
                className={`morph-gallery-thumb-btn ${idx === currentIndex ? "active" : ""}`}
              >
                <img
                  src={item.thumb || item.src}
                  alt=""
                  className="morph-gallery-thumb-img"
                  loading="lazy"
                  decoding="async"
                />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Screen Reader Announcement */}
      <span className="morph-gallery-sr-only" aria-live="polite">
        {currentItem?.alt || `Image ${currentIndex + 1}`} — {currentIndex + 1} of {items.length}
      </span>
    </section>
  );
}
