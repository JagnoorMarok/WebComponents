import React, { useEffect, useRef } from 'react';

/**
 * Eclipse - A turbulent spectral corona burning around a dark eclipse
 * Zero-dependency WebGL shader component with chromatic diffraction,
 * viscoelastic fluid edge deformation, solar prominences, customizable rim flare,
 * and interactive pointer pull.
 */
export const Eclipse = ({
  className = '',
  style = {},
  children,
  coreRadius = 0.28,
  coronaSize = 0.45,
  turbulence = 1.0,
  speed = 1.0,
  intensity = 1.2,
  rimIntensity = 1.6,
  spectralShift = 0.8,
  liquidity = 1.0, // Liquid fluid edge deformation & mouse pull
  colorMode = 0, // 0: Spectral, 1: Solar Gold, 2: Ultraviolet, 3: Deep Cyan, 4: Blood Moon
  interactive = true,
  particleDensity = 0.5,
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    let isWebGl = !!gl;
    let animationFrameId;
    let startTime = performance.now();

    let targetMouse = { x: 0.5, y: 0.5 };
    let currentMouse = { x: 0.5, y: 0.5 };

    // Vertex Shader
    const vsSource = `
      attribute vec2 a_position;
      varying vec2 v_uv;
      void main() {
        v_uv = (a_position + 1.0) * 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    // Fragment Shader: Liquid Eclipse with Spectral Corona
    const fsSource = `
      precision highp float;
      varying vec2 v_uv;

      uniform vec2 u_resolution;
      uniform float u_time;
      uniform vec2 u_mouse;
      uniform float u_coreRadius;
      uniform float u_coronaSize;
      uniform float u_turbulence;
      uniform float u_speed;
      uniform float u_intensity;
      uniform float u_rimIntensity;
      uniform float u_spectralShift;
      uniform float u_liquidity;
      uniform int u_colorMode;
      uniform float u_particleDensity;

      #define PI 3.14159265359

      // 2D Hash & Noise
      float hash(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }

      // Fractional Brownian Motion for turbulent solar plasma & fluid distortion
      float fbm(vec2 p) {
        float v = 0.0;
        float a = 0.55;
        vec2 shift = vec2(100.0);
        mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
        for (int i = 0; i < 5; ++i) {
          v += a * noise(p);
          p = rot * p * 2.05 + shift;
          a *= 0.48;
        }
        return v;
      }

      // Spectral wavelength to RGB approximation
      vec3 spectralPalette(float t) {
        vec3 a = vec3(0.5, 0.5, 0.5);
        vec3 b = vec3(0.5, 0.5, 0.5);
        vec3 c = vec3(1.0, 1.0, 1.0);
        vec3 d = vec3(0.00, 0.33, 0.67);
        return a + b * cos(2.0 * PI * (c * t + d));
      }

      // Color themes
      vec3 applyTheme(float flare, float rim, float spectralVal, int mode) {
        if (mode == 1) {
          // Solar Gold / Amber Corona
          vec3 coreColor = vec3(1.0, 0.95, 0.85);
          vec3 midColor = vec3(1.0, 0.55, 0.12);
          vec3 outerColor = vec3(0.85, 0.18, 0.04);
          vec3 col = mix(outerColor, midColor, flare);
          col = mix(col, coreColor, rim);
          return col * (flare + rim * 1.5);
        } else if (mode == 2) {
          // Ultraviolet / Cyberpunk
          vec3 coreColor = vec3(0.9, 0.8, 1.0);
          vec3 midColor = vec3(0.65, 0.15, 0.95);
          vec3 outerColor = vec3(0.12, 0.05, 0.45);
          vec3 col = mix(outerColor, midColor, flare);
          col = mix(col, coreColor, rim);
          return col * (flare + rim * 1.4);
        } else if (mode == 3) {
          // Deep Cyan / Ice Corona
          vec3 coreColor = vec3(0.85, 1.0, 1.0);
          vec3 midColor = vec3(0.05, 0.75, 0.85);
          vec3 outerColor = vec3(0.02, 0.15, 0.4);
          vec3 col = mix(outerColor, midColor, flare);
          col = mix(col, coreColor, rim);
          return col * (flare + rim * 1.4);
        } else if (mode == 4) {
          // Blood Moon / Crimson Eclipse
          vec3 coreColor = vec3(1.0, 0.8, 0.7);
          vec3 midColor = vec3(0.95, 0.15, 0.1);
          vec3 outerColor = vec3(0.3, 0.02, 0.05);
          vec3 col = mix(outerColor, midColor, flare);
          col = mix(col, coreColor, rim);
          return col * (flare + rim * 1.5);
        }

        // Mode 0: Full Spectral Diffraction (Prismatic rainbow corona)
        vec3 spectralCol = spectralPalette(spectralVal * 0.8 + 0.15);
        vec3 rimCol = vec3(1.0, 0.98, 0.92);
        vec3 finalCol = mix(spectralCol * flare, rimCol, rim * 0.9);
        return finalCol * (flare * 1.2 + rim * 1.8);
      }

      void main() {
        float minRes = min(u_resolution.x, u_resolution.y);
        vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / minRes;
        
        // Mouse coordinate in centered, aspect-corrected space
        vec2 mouseCoord = (u_mouse - 0.5) * (u_resolution / minRes);

        // Center parallax drift
        vec2 centerOffset = (u_mouse - 0.5) * 0.08;
        vec2 p = uv - centerOffset;

        float dist = length(p);
        float angle = atan(p.y, p.x);

        float t = u_time * u_speed * 0.4;

        // ---- LIQUID DEFORMATION PHYSICS ----
        // The eclipse is an organic, fluid droplet that is attracted to and deformed by the mouse
        float liquidDisplacement = 0.0;

        if (u_liquidity > 0.01) {
          // 1. Fluid surface tension capillary waves around perimeter
          float wave1 = sin(angle * 3.0 + t * 2.2) * 0.45;
          float wave2 = cos(angle * 5.0 - t * 1.7) * 0.35;
          float wave3 = sin(angle * 7.0 + t * 3.1) * 0.20;
          float capillaryOscillation = (wave1 + wave2 + wave3) * (0.022 * u_liquidity);

          // 2. Low-frequency fluid plasma turbulence
          float fluidTurbulence = (fbm(vec2(cos(angle) * 2.6, sin(angle) * 2.6) + vec2(t * 0.3, t * 0.4)) - 0.5) * (0.035 * u_liquidity);

          // 3. Mouse pointer liquid attraction & gravitational/viscous pull
          vec2 toMouse = mouseCoord - p;
          float distToMouse = length(toMouse);

          // Direction from center to mouse vs radial direction of current point
          vec2 radialDir = normalize(p + 0.0001);
          vec2 dirToMouse = normalize(toMouse + 0.0001);
          float mouseAlignment = dot(radialDir, dirToMouse);

          // Proximity falloff of cursor attraction
          float cursorInfluence = exp(-pow(distToMouse / 0.42, 2.0));

          // Fluid droplet stretching outward toward the pointer
          float fluidBulge = 0.0;
          if (mouseAlignment > -0.3) {
            float stretchFactor = pow(max(0.0, mouseAlignment + 0.3) / 1.3, 1.5);
            fluidBulge = cursorInfluence * stretchFactor * (0.13 * u_liquidity);
          }

          // Capillary ripple radiating from cursor interaction
          float cursorRipple = sin(distToMouse * 26.0 - t * 8.0) * exp(-distToMouse * 6.5) * (0.025 * u_liquidity);

          liquidDisplacement = capillaryOscillation + fluidTurbulence + fluidBulge + cursorRipple;
        }

        // Non-rigid dynamic liquid core radius
        float effectiveCoreRadius = u_coreRadius + liquidDisplacement;
        float dRel = dist - effectiveCoreRadius;

        // Radial streamer noise layers
        float radialStream1 = fbm(vec2(cos(angle) * 3.0, sin(angle) * 3.0) + vec2(dist * 2.0 - t * 0.6, t * 0.3));
        float radialStream2 = fbm(vec2(sin(angle * 2.0) * 4.0, dist * 5.0 - t * 0.9));
        
        // Solar prominence / plasma flares
        float prominence = pow(fbm(vec2(angle * 3.0 - t * 0.2, dist * 4.0 - t * 0.5)), 2.5) * 2.2;
        float rays = mix(radialStream1, radialStream2, 0.5) + prominence * 0.6;

        // Spectral chromatic aberration (sampling at shifted angles relative to fluid distance)
        float shift = u_spectralShift * 0.08 * dRel;
        float rayR = fbm(vec2(cos(angle + shift) * 3.0, sin(angle + shift) * 3.0) + vec2(dist * 2.2 - t * 0.6, t * 0.3));
        float rayB = fbm(vec2(cos(angle - shift) * 3.0, sin(angle - shift) * 3.0) + vec2(dist * 2.2 - t * 0.6, t * 0.3));

        // Corona falloff matching the liquid contour
        float coronaFalloff = 0.0;
        if (dRel > 0.0) {
          coronaFalloff = exp(-dRel / (u_coronaSize * 0.45));
          coronaFalloff = pow(coronaFalloff, 1.2);
        }

        // Diamond rim / limb brightening hugging the fluid liquid edge
        float rimWidth = 0.016;
        float rim = exp(-pow(dRel / rimWidth, 2.0)) * u_rimIntensity;

        // Sharp anti-aliased mask for dark liquid body (the occulting fluid sphere)
        float moonMask = smoothstep(-0.004, 0.004, dRel);

        // Corona plasma value
        float coronaPlasma = (rays * 0.7 + rayR * 0.15 + rayB * 0.15) * coronaFalloff * u_intensity;

        // Spectral parameter across space & ray variance
        float spectralParam = fract(dist * 1.5 - t * 0.15 + (rayR - rayB) * 0.5);

        // Base theme color
        vec3 color = applyTheme(coronaPlasma, rim, spectralParam, u_colorMode);

        // Subtle cosmic star dust in the background
        if (u_particleDensity > 0.05 && dist > effectiveCoreRadius + 0.05) {
          vec2 st = uv * 35.0;
          float starNoise = hash(floor(st));
          if (starNoise > (1.0 - u_particleDensity * 0.04)) {
            float starDist = length(fract(st) - 0.5);
            float twinkle = 0.5 + 0.5 * sin(u_time * 2.0 + starNoise * 6.28);
            float star = smoothstep(0.12, 0.01, starDist) * twinkle * 0.6;
            color += vec3(star) * (1.0 - rim);
          }
        }

        // Dark celestial body occlusion
        color *= moonMask;

        // Soft vignette on edges
        float edgeVig = 1.0 - smoothstep(0.7, 1.4, length(uv));
        color *= edgeVig;

        gl_FragColor = vec4(color, 1.0);
      }
    `;

    function createShader(glCtx, type, source) {
      const shader = glCtx.createShader(type);
      glCtx.shaderSource(shader, source);
      glCtx.compileShader(shader);
      if (!glCtx.getShaderParameter(shader, glCtx.COMPILE_STATUS)) {
        console.error('Shader compile failed: ', glCtx.getShaderInfoLog(shader));
        glCtx.deleteShader(shader);
        return null;
      }
      return shader;
    }

    let program = null;
    let posBuffer = null;
    let uniforms = {};

    if (isWebGl) {
      const vertShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
      const fragShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
      if (!vertShader || !fragShader) {
        isWebGl = false;
      } else {
        program = gl.createProgram();
        gl.attachShader(program, vertShader);
        gl.attachShader(program, fragShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
          console.error('Program link failed: ', gl.getProgramInfoLog(program));
          isWebGl = false;
        } else {
          gl.useProgram(program);
          posBuffer = gl.createBuffer();
          gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
          const positions = new Float32Array([
            -1.0, -1.0,
             1.0, -1.0,
            -1.0,  1.0,
            -1.0,  1.0,
             1.0, -1.0,
             1.0,  1.0,
          ]);
          gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

          const aPosition = gl.getAttribLocation(program, 'a_position');
          gl.enableVertexAttribArray(aPosition);
          gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

          uniforms = {
            u_resolution: gl.getUniformLocation(program, 'u_resolution'),
            u_time: gl.getUniformLocation(program, 'u_time'),
            u_mouse: gl.getUniformLocation(program, 'u_mouse'),
            u_coreRadius: gl.getUniformLocation(program, 'u_coreRadius'),
            u_coronaSize: gl.getUniformLocation(program, 'u_coronaSize'),
            u_turbulence: gl.getUniformLocation(program, 'u_turbulence'),
            u_speed: gl.getUniformLocation(program, 'u_speed'),
            u_intensity: gl.getUniformLocation(program, 'u_intensity'),
            u_rimIntensity: gl.getUniformLocation(program, 'u_rimIntensity'),
            u_spectralShift: gl.getUniformLocation(program, 'u_spectralShift'),
            u_liquidity: gl.getUniformLocation(program, 'u_liquidity'),
            u_colorMode: gl.getUniformLocation(program, 'u_colorMode'),
            u_particleDensity: gl.getUniformLocation(program, 'u_particleDensity'),
          };
        }
      }
    }

    const resize = () => {
      const parent = canvas.parentElement;
      const width = parent && parent.offsetWidth > 0 ? parent.offsetWidth : window.innerWidth;
      const height = parent && parent.offsetHeight > 0 ? parent.offsetHeight : window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      if (isWebGl && gl) {
        gl.viewport(0, 0, canvas.width, canvas.height);
      }
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    const handlePointerMove = (e) => {
      if (!interactive) return;
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1.0 - (e.clientY - rect.top) / rect.height; // WebGL UV Y is inverted
      targetMouse.x = Math.max(0.0, Math.min(1.0, x));
      targetMouse.y = Math.max(0.0, Math.min(1.0, y));
    };

    window.addEventListener('pointermove', handlePointerMove);

    // Fallback 2D Canvas renderer with liquid path deformation if WebGL is unavailable
    const render2DFallback = (ctx, time) => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = '#050508';
      ctx.fillRect(0, 0, w, h);

      const cx = w * 0.5 + (currentMouse.x - 0.5) * w * 0.08;
      const cy = h * 0.5 - (currentMouse.y - 0.5) * h * 0.08;
      const minDim = Math.min(w, h);
      const rCore = minDim * coreRadius;
      const rOuter = rCore + minDim * coronaSize;

      // Corona gradient
      const grad = ctx.createRadialGradient(cx, cy, rCore * 0.95, cx, cy, rOuter);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
      grad.addColorStop(0.1, 'rgba(255, 210, 120, 0.7)');
      grad.addColorStop(0.4, 'rgba(180, 80, 220, 0.4)');
      grad.addColorStop(0.8, 'rgba(40, 90, 220, 0.15)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, rOuter, 0, Math.PI * 2);
      ctx.fill();

      // Liquid dark celestial body contour
      ctx.save();
      ctx.translate(cx, cy);

      const segments = 64;
      ctx.beginPath();
      for (let i = 0; i <= segments; i++) {
        const a = (i / segments) * Math.PI * 2;
        const wobble = Math.sin(a * 3 + time * 0.002) * (rCore * 0.05 * liquidity) +
                       Math.cos(a * 5 - time * 0.0015) * (rCore * 0.03 * liquidity);
        const curR = rCore + wobble;
        const x = Math.cos(a) * curR;
        const y = Math.sin(a) * curR;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fillStyle = '#000000';
      ctx.fill();

      // Bright fluid rim
      ctx.strokeStyle = `rgba(255, 255, 255, ${Math.min(1.0, 0.8 * rimIntensity)})`;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();
    };

    // Render loop
    const render = (now) => {
      const elapsed = (now - startTime) * 0.001;

      // Smooth mouse damping for viscous fluid feeling
      currentMouse.x += (targetMouse.x - currentMouse.x) * 0.09;
      currentMouse.y += (targetMouse.y - currentMouse.y) * 0.09;

      if (isWebGl && gl && program) {
        gl.uniform2f(uniforms.u_resolution, canvas.width, canvas.height);
        gl.uniform1f(uniforms.u_time, elapsed);
        gl.uniform2f(uniforms.u_mouse, currentMouse.x, currentMouse.y);
        gl.uniform1f(uniforms.u_coreRadius, coreRadius);
        gl.uniform1f(uniforms.u_coronaSize, coronaSize);
        gl.uniform1f(uniforms.u_turbulence, turbulence);
        gl.uniform1f(uniforms.u_speed, speed);
        gl.uniform1f(uniforms.u_intensity, intensity);
        gl.uniform1f(uniforms.u_rimIntensity, rimIntensity);
        gl.uniform1f(uniforms.u_spectralShift, spectralShift);
        gl.uniform1f(uniforms.u_liquidity, liquidity);
        gl.uniform1i(uniforms.u_colorMode, colorMode);
        gl.uniform1f(uniforms.u_particleDensity, particleDensity);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
      } else {
        const ctx2d = canvas.getContext('2d');
        if (ctx2d) {
          render2DFallback(ctx2d, now);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('pointermove', handlePointerMove);
      resizeObserver.disconnect();
      if (isWebGl && gl) {
        if (program) gl.deleteProgram(program);
        if (posBuffer) gl.deleteBuffer(posBuffer);
      }
    };
  }, [
    coreRadius,
    coronaSize,
    turbulence,
    speed,
    intensity,
    rimIntensity,
    spectralShift,
    liquidity,
    colorMode,
    interactive,
    particleDensity,
  ]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-[300px] overflow-hidden bg-black select-none ${className}`}
      style={style}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block pointer-events-auto"
      />
      {children && (
        <div className="relative z-10 w-full h-full pointer-events-none">
          {children}
        </div>
      )}
    </div>
  );
};

export default Eclipse;
