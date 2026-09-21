import React, { useEffect, useRef, useState } from "react";
import "./water-ripple-image.css";

// WebGL Vertex Shader
const VERTEX_SHADER = `
precision mediump float;
varying vec2 vUv;
attribute vec2 a_position;
void main() {
  vUv = 0.5 * (a_position + 1.0);
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

// WebGL Fragment Shader with Simplex Noise & Procedural Water Harmonics
const FRAGMENT_SHADER = `
precision mediump float;

varying vec2 vUv;
uniform sampler2D u_image_texture;
uniform float u_time;
uniform float u_ratio;
uniform float u_img_ratio;
uniform float u_blueish;
uniform float u_scale;
uniform float u_illumination;
uniform float u_surface_distortion;
uniform float u_water_distortion;

#define TWO_PI 6.28318530718
#define PI 3.14159265358979323846

vec3 mod289(vec3 x) { return x - floor(x * (1. / 289.)) * 289.; }
vec2 mod289(vec2 x) { return x - floor(x * (1. / 289.)) * 289.; }
vec3 permute(vec3 x) { return mod289(((x * 34.) + 1.) * x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1., 0.) : vec2(0., 1.);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0., i1.y, 1.)) + i.x + vec3(0., i1.x, 1.));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.);
  m = m * m;
  m = m * m;
  vec3 x = 2. * fract(p * C.www) - 1.;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130. * dot(m, g);
}

mat2 rotate2D(float r) {
  return mat2(cos(r), sin(r), -sin(r), cos(r));
}

float surface_noise(vec2 uv, float t, float scale) {
  vec2 n = vec2(.1);
  vec2 N = vec2(.1);
  mat2 m = rotate2D(.5);
  for (int j = 0; j < 10; j++) {
    uv *= m;
    n *= m;
    vec2 q = uv * scale + float(j) + n + (.5 + .5 * float(j)) * (mod(float(j), 2.) - 1.) * t;
    n += sin(q);
    N += cos(q) / scale;
    scale *= 1.2;
  }
  return (N.x + N.y + .1);
}

void main() {
  vec2 uv = vUv;
  uv.y = 1. - uv.y;
  uv.x *= u_ratio;

  float t = .002 * u_time;
  vec3 color = vec3(0.);
  float opacity = 0.;

  float outer_noise = snoise((.3 + .1 * sin(t)) * uv + vec2(0., .2 * t));
  vec2 surface_noise_uv = 2. * uv + (outer_noise * .2);

  float surf = surface_noise(surface_noise_uv, t, u_scale);
  surf *= pow(uv.y, .3);
  surf = pow(surf, 2.);

  vec2 img_uv = vUv;
  img_uv -= .5;
  if (u_ratio > u_img_ratio) {
    img_uv.x = img_uv.x * u_ratio / u_img_ratio;
  } else {
    img_uv.y = img_uv.y * u_img_ratio / u_ratio;
  }
  float scale_factor = 1.4;
  img_uv *= scale_factor;
  img_uv += .5;
  img_uv.y = 1. - img_uv.y;

  img_uv += (u_water_distortion * outer_noise);
  img_uv += (u_surface_distortion * surf);

  vec4 img = texture2D(u_image_texture, img_uv);
  img *= (1. + u_illumination * surf);

  color += img.rgb;
  color += u_illumination * vec3(1. - u_blueish, 1., 1.) * surf;
  opacity += img.a;

  float edge_width = .02;
  float edge_alpha = smoothstep(0., edge_width, img_uv.x) * smoothstep(1., 1. - edge_width, img_uv.x);
  edge_alpha *= smoothstep(0., edge_width, img_uv.y) * smoothstep(1., 1. - edge_width, img_uv.y);
  color *= edge_alpha;
  opacity *= edge_alpha;

  gl_FragColor = vec4(color, opacity);
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
    throw new Error("Shader compile error: " + (info || "unknown"));
  }
  return shader;
}

function createProgram(gl, vsSource, fsSource) {
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
    throw new Error("Program link error: " + (info || "unknown"));
  }
  return program;
}

export function WaterRippleImage({
  src = "/assets/water-ripple/default.jpg",
  blueish = 0.4,
  scale = 7,
  illumination = 0.15,
  surfaceDistortion = 0.03,
  waterDistortion = 0.02,
  allowUpload = true,
  className = "",
  children,
}) {
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const glRef = useRef(null);
  const programRef = useRef(null);
  const uniformsRef = useRef({});
  const textureRef = useRef(null);
  const currentImageRef = useRef(null);
  const animFrameRef = useRef(null);

  const [activeSrc, setActiveSrc] = useState(src);

  useEffect(() => {
    setActiveSrc(src);
  }, [src]);

  const updateUniforms = (gl) => {
    const u = uniformsRef.current;
    if (!u) return;
    if (u.u_blueish) gl.uniform1f(u.u_blueish, blueish);
    if (u.u_scale) gl.uniform1f(u.u_scale, scale);
    if (u.u_illumination) gl.uniform1f(u.u_illumination, illumination);
    if (u.u_surface_distortion) gl.uniform1f(u.u_surface_distortion, surfaceDistortion);
    if (u.u_water_distortion) gl.uniform1f(u.u_water_distortion, waterDistortion);
  };

  const setTextureFromImage = (gl, img) => {
    if (textureRef.current) {
      gl.deleteTexture(textureRef.current);
    }
    const texture = gl.createTexture();
    textureRef.current = texture;

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

    const u = uniformsRef.current;
    if (u.u_image_texture) gl.uniform1i(u.u_image_texture, 0);

    const canvas = canvasRef.current;
    if (canvas && u.u_ratio && u.u_img_ratio) {
      const imgRatio = img.naturalWidth / Math.max(img.naturalHeight, 1);
      gl.uniform1f(u.u_ratio, canvas.width / Math.max(canvas.height, 1));
      gl.uniform1f(u.u_img_ratio, imgRatio);
    }
  };

  const loadImage = (imageSrc, gl) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      if (imageSrc.startsWith("http://") || imageSrc.startsWith("https://")) {
        img.crossOrigin = "anonymous";
      }
      img.onload = () => {
        currentImageRef.current = img;
        setTextureFromImage(gl, img);
        resolve(img);
      };
      img.onerror = (err) => {
        console.warn("Failed to load image texture for WaterRippleImage:", imageSrc);
        reject(err);
      };
      img.src = imageSrc;
    });
  };

  const resize = () => {
    const gl = glRef.current;
    const canvas = canvasRef.current;
    if (!gl || !canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.floor(canvas.clientWidth * dpr);
    const h = Math.floor(canvas.clientHeight * dpr);

    if (w === 0 || h === 0) return;

    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }

    const u = uniformsRef.current;
    if (u.u_ratio) {
      gl.uniform1f(u.u_ratio, canvas.width / Math.max(canvas.height, 1));
    }
    if (currentImageRef.current && u.u_img_ratio) {
      const imgRatio = currentImageRef.current.naturalWidth / Math.max(currentImageRef.current.naturalHeight, 1);
      gl.uniform1f(u.u_img_ratio, imgRatio);
    }
  };

  // WebGL initialization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl =
      canvas.getContext("webgl", { alpha: true, antialias: true }) ||
      canvas.getContext("experimental-webgl");

    if (!gl) {
      console.error("WebGL is not supported in this browser environment");
      return;
    }

    glRef.current = gl;

    let program = null;
    let buffer = null;

    try {
      program = createProgram(gl, VERTEX_SHADER, FRAGMENT_SHADER);
      programRef.current = program;
      gl.useProgram(program);

      // Collect all active uniforms
      const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
      for (let i = 0; i < numUniforms; i++) {
        const info = gl.getActiveUniform(program, i);
        if (info) {
          uniformsRef.current[info.name] = gl.getUniformLocation(program, info.name);
        }
      }

      // Create screen-filling quad geometry
      const quadVertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
      buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, quadVertices, gl.STATIC_DRAW);

      const posAttr = gl.getAttribLocation(program, "a_position");
      gl.enableVertexAttribArray(posAttr);
      gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);

      updateUniforms(gl);
      resize();

      loadImage(activeSrc, gl).catch((e) => console.error(e));

      const resizeObserver = new ResizeObserver(() => resize());
      resizeObserver.observe(canvas);

      const render = () => {
        const u = uniformsRef.current;
        if (u.u_time) {
          gl.uniform1f(u.u_time, performance.now());
        }
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        animFrameRef.current = requestAnimationFrame(render);
      };

      animFrameRef.current = requestAnimationFrame(render);

      return () => {
        resizeObserver.disconnect();
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        if (textureRef.current) gl.deleteTexture(textureRef.current);
        if (buffer) gl.deleteBuffer(buffer);
        if (program) {
          gl.useProgram(null);
          gl.deleteProgram(program);
        }
      };
    } catch (err) {
      console.error("WaterRippleImage WebGL initialization failed:", err);
    }
  }, []);

  // Update dynamic uniform parameters
  useEffect(() => {
    const gl = glRef.current;
    if (gl) updateUniforms(gl);
  }, [blueish, scale, illumination, surfaceDistortion, waterDistortion]);

  // Load new activeSrc when prop changes
  useEffect(() => {
    const gl = glRef.current;
    if (gl && activeSrc) {
      loadImage(activeSrc, gl).catch((e) => console.error(e));
    }
  }, [activeSrc]);

  // File upload change handler
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      const gl = glRef.current;
      if (dataUrl && gl) {
        loadImage(dataUrl, gl).catch((err) => console.error(err));
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className={`water-ripple-root ${className}`}>
      {/* Hidden File Input for Custom Uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="water-ripple-file-input"
        aria-label="Upload custom image for water ripple effect"
      />

      {/* WebGL Canvas */}
      <canvas ref={canvasRef} className="water-ripple-canvas" />

      {/* Vignette Gradients */}
      <div className="water-ripple-vignette" aria-hidden="true" />
      <div className="water-ripple-gradient-bottom" aria-hidden="true" />

      {/* Status Tag */}
      <div className="water-ripple-badge">
        <span className="water-ripple-badge-dot" />
        <span>WebGL Fluid Harmonics</span>
      </div>

      {/* Floating Action Controls */}
      {allowUpload && (
        <div className="water-ripple-actions">
          <button
            type="button"
            className="water-ripple-action-btn"
            onClick={() => fileInputRef.current?.click()}
            title="Upload your own photo"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <span>Upload Photo</span>
          </button>
        </div>
      )}

      {/* Optional Child Overlay / Typography */}
      {children && <div className="water-ripple-content">{children}</div>}
    </div>
  );
}

export default WaterRippleImage;
