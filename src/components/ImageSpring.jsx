import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { springCardsData, SPRING_CONFIG } from '../data/imageSpringData';
import './ImageSpring.css';

/**
 * Creates a high-fidelity canvas texture for an Image Spring card.
 */
function createSpringCardTexture(item, onLoaded) {
  const canvas = document.createElement('canvas');
  canvas.width = 440;
  canvas.height = 580;
  const ctx = canvas.getContext('2d');

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;

  const render = (img) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const isPolaroid = item.theme === 'polaroid';
    const isCream = item.theme === 'cream';

    // Base card surface fill
    ctx.fillStyle = isPolaroid ? '#f8f7f2' : isCream ? '#eae6db' : '#11141a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle edge border
    ctx.strokeStyle = isPolaroid
      ? 'rgba(0,0,0,0.12)'
      : isCream
      ? 'rgba(0,0,0,0.15)'
      : 'rgba(255,255,255,0.14)';
    ctx.lineWidth = 3;
    ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);

    // Inner photo container with rounded corners
    const pad = isPolaroid ? 18 : isCream ? 14 : 10;
    const imgH = isPolaroid ? canvas.height - 110 : canvas.height - 80;
    const imgW = canvas.width - pad * 2;

    if (img && img.complete && img.naturalWidth !== 0) {
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(pad, pad, imgW, imgH, 12);
      ctx.clip();

      const scale = Math.max(imgW / img.naturalWidth, imgH / img.naturalHeight);
      const sw = img.naturalWidth * scale;
      const sh = img.naturalHeight * scale;
      const sx = pad + (imgW - sw) / 2;
      const sy = pad + (imgH - sh) / 2;

      ctx.drawImage(img, sx, sy, sw, sh);

      // Gradient overlay for ambient lighting reflection
      const grad = ctx.createLinearGradient(pad, pad, pad + imgW, pad + imgH);
      grad.addColorStop(0, 'rgba(255,255,255,0.18)');
      grad.addColorStop(0.35, 'rgba(255,255,255,0.02)');
      grad.addColorStop(0.7, 'rgba(0,0,0,0.14)');
      ctx.fillStyle = grad;
      ctx.fillRect(pad, pad, imgW, imgH);
      ctx.restore();
    } else {
      ctx.fillStyle = '#1e242d';
      ctx.fillRect(pad, pad, imgW, imgH);
    }

    // Typography
    const textColor = isPolaroid || isCream ? '#16191f' : '#f1f5f9';
    const subColor = isPolaroid || isCream ? '#64748b' : '#94a3b8';

    ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = textColor;
    ctx.fillText(item.title, pad + 4, canvas.height - 48);

    ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace';
    ctx.fillStyle = subColor;
    ctx.fillText(`SPRING // ${item.category}`, pad + 4, canvas.height - 24);

    texture.needsUpdate = true;
    if (onLoaded) onLoaded();
  };

  render(null);

  const image = new Image();
  image.crossOrigin = 'anonymous';
  image.src = item.image;
  image.onload = () => render(image);

  return texture;
}

/**
 * Custom THREE.Curve implementation for a horizontal helical spring.
 */
class HelixCurve extends THREE.Curve {
  constructor(radius, pitch, turns) {
    super();
    this.radius = radius;
    this.pitch = pitch;
    this.turns = turns;
  }

  getPoint(u, target = new THREE.Vector3()) {
    const totalT = this.turns * Math.PI * 2;
    const t = (u - 0.5) * totalT;
    const x = t * this.pitch;
    const y = this.radius * Math.sin(t);
    const z = this.radius * Math.cos(t);
    return target.set(x, y, z);
  }
}

/**
 * Updates vertex positions and normals of the card geometry so that it
 * physically bends to match the exact cylindrical curvature of the spring of radius `radius`.
 * 
 * In world space, every vertex on the card satisfies y^2 + z^2 = radius^2, and its
 * surface normal is strictly collinear with the radial vector from the central horizontal axis.
 */
function updateSpringCurvedGeometry(geom, w, h, radius, segX = 24, segY = 16) {
  const posAttr = geom.attributes.position;
  const normAttr = geom.attributes.normal;
  const count = posAttr.count;

  for (let i = 0; i < count; i++) {
    const col = i % (segX + 1);
    const row = Math.floor(i / (segX + 1));
    const u = (col / segX - 0.5) * w;
    const v = (0.5 - row / segY) * h;

    // Angle around the spring's circular cross-section
    const theta = v / radius;

    // Position in card local coordinates (curves backward along -Z towards the central axis)
    const px = u;
    const py = radius * Math.sin(theta);
    const pz = radius * (Math.cos(theta) - 1);

    // Normal vector in local coordinates
    const nx = 0;
    const ny = Math.sin(theta);
    const nz = Math.cos(theta);

    posAttr.setXYZ(i, px, py, pz);
    normAttr.setXYZ(i, nx, ny, nz);
  }

  posAttr.needsUpdate = true;
  normAttr.needsUpdate = true;
  geom.computeBoundingSphere();
}

/**
 * Calculates the exact 3D position and orientation quaternion for a card at parameter t on the helix.
 * The card's face normal is STRICTLY parallel to the radius vector drawn from the central horizontal
 * axis (t * pitch, 0, 0) to the center of the card.
 */
function getHelixTransform(t, radius, pitch, targetPos, targetQuat) {
  // 1. Position along horizontal helix
  const x = t * pitch;
  const y = radius * Math.sin(t);
  const z = radius * Math.cos(t);
  targetPos.set(x, y, z);

  // 2. Unit radial normal vector pointing outward from the central horizontal X axis (x, 0, 0)
  // Normal is strictly perpendicular to the central axis and collinear with the radius vector
  const normal = new THREE.Vector3(0, Math.sin(t), Math.cos(t));

  // 3. Circumference tangent vector (tangent to the circular cross-section in YZ):
  const tangentCirc = new THREE.Vector3(0, Math.cos(t), -Math.sin(t));

  // 4. Longitudinal axis vector (along the horizontal spring from left to right):
  const axisX = new THREE.Vector3(1, 0, 0);

  // Orthonormal basis:
  // - Local X (card width): along longitudinal axisX (1, 0, 0)
  // - Local Y (card height, curved around circumference): along tangentCirc (0, cos(t), -sin(t))
  // - Local Z (card face normal): strictly along radial normal (0, sin(t), cos(t))
  // (axisX x tangentCirc = normal; det = +1)
  const basis = new THREE.Matrix4().makeBasis(axisX, tangentCirc, normal);
  targetQuat.setFromRotationMatrix(basis);
}

export default function ImageSpring() {
  const containerRef = useRef(null);

  // Interactive HUD States
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(SPRING_CONFIG.defaultSpeed);
  const [radius, setRadius] = useState(SPRING_CONFIG.defaultRadius);
  const [pitch, setPitch] = useState(SPRING_CONFIG.defaultPitch);
  const [turns, setTurns] = useState(SPRING_CONFIG.defaultTurns);
  const [cardCount, setCardCount] = useState(SPRING_CONFIG.defaultCardCount);
  const [direction, setDirection] = useState(1); // 1 = forward (left to right), -1 = reverse
  const [showWireGuide, setShowWireGuide] = useState(true);

  // Refs for 60 FPS RAF loop
  const isPlayingRef = useRef(isPlaying);
  const speedRef = useRef(speed);
  const radiusRef = useRef(radius);
  const pitchRef = useRef(pitch);
  const turnsRef = useRef(turns);
  const cardCountRef = useRef(cardCount);
  const directionRef = useRef(direction);
  const showWireGuideRef = useRef(showWireGuide);

  const springGroupRef = useRef(null);
  const cardMeshesRef = useRef([]);
  const wireMeshRef = useRef(null);

  // Interaction refs (mouse drag & velocity)
  const isDraggingRef = useRef(false);
  const mousePosRef = useRef({ x: 0, y: 0 });
  const velocityRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    isPlayingRef.current = isPlaying;
    speedRef.current = speed;
    radiusRef.current = radius;
    pitchRef.current = pitch;
    turnsRef.current = turns;
    cardCountRef.current = cardCount;
    directionRef.current = direction;
    showWireGuideRef.current = showWireGuide;
  }, [isPlaying, speed, radius, pitch, turns, cardCount, direction, showWireGuide]);

  // Wire Guide Geometry update
  const updateWireGuide = useCallback((rad, pit, trn, visible) => {
    if (!wireMeshRef.current) return;
    wireMeshRef.current.visible = visible;
    if (!visible) return;

    wireMeshRef.current.geometry.dispose();
    const curve = new HelixCurve(rad, pit, trn);
    wireMeshRef.current.geometry = new THREE.TubeGeometry(curve, 240, 0.045, 8, false);
  }, []);

  // Update curved card geometries when spring radius changes
  const updateCardGeometries = useCallback((rad) => {
    const meshes = cardMeshesRef.current;
    if (!meshes || !meshes.length) return;
    for (let i = 0; i < meshes.length; i++) {
      const mesh = meshes[i];
      if (mesh.geometry && mesh.userData.w && mesh.userData.h) {
        updateSpringCurvedGeometry(mesh.geometry, mesh.userData.w, mesh.userData.h, rad);
      }
    }
  }, []);

  useEffect(() => {
    updateWireGuide(radius, pitch, turns, showWireGuide);
    updateCardGeometries(radius);
  }, [radius, pitch, turns, showWireGuide, updateWireGuide, updateCardGeometries]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x07080c);

    const camera = new THREE.PerspectiveCamera(
      SPRING_CONFIG.cameraFOV,
      width / height,
      0.1,
      100
    );
    // Camera angled slightly elevated & pitched down to showcase both side progression and circular coils
    camera.position.set(0, SPRING_CONFIG.cameraYOffset, SPRING_CONFIG.cameraDistance);
    camera.lookAt(0, 0, 0);

    // 2. High-Performance WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // 3. Multi-point Lighting: Ambient + Key + Rim Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.35);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xf5f8ff, 2.4);
    keyLight.position.set(10, 14, 15);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x7da2c8, 1.1);
    fillLight.position.set(-12, -8, -10);
    scene.add(fillLight);

    const rimCyan = new THREE.PointLight(0x38bdf8, 2.8, 35);
    rimCyan.position.set(-8, 8, 10);
    scene.add(rimCyan);

    const rimPurple = new THREE.PointLight(0xa855f7, 2.6, 35);
    rimPurple.position.set(8, -6, 10);
    scene.add(rimPurple);

    // 4. Spring Group Anchor with natural slight diagonal tilt
    const springGroup = new THREE.Group();
    springGroup.rotation.y = SPRING_CONFIG.cameraYAngle;
    springGroup.rotation.x = SPRING_CONFIG.cameraXAngle;
    scene.add(springGroup);
    springGroupRef.current = springGroup;

    // 5. Spring Wire Guide (Helix tube)
    const helixCurve = new HelixCurve(radiusRef.current, pitchRef.current, turnsRef.current);
    const wireGeom = new THREE.TubeGeometry(helixCurve, 240, 0.045, 8, false);
    const wireMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.65,
      roughness: 0.3,
      metalness: 0.8,
      transparent: true,
      opacity: 0.45,
    });
    const wireMesh = new THREE.Mesh(wireGeom, wireMat);
    wireMesh.visible = showWireGuideRef.current;
    springGroup.add(wireMesh);
    wireMeshRef.current = wireMesh;

    // 6. Pre-cache Canvas Textures
    const cachedTextures = springCardsData.map((item) =>
      createSpringCardTexture(item, () => {
        renderer.render(scene, camera);
      })
    );

    // 7. Instantiate Maximum Pool of Card Meshes
    const maxCards = SPRING_CONFIG.maxCardCount;
    const cardMeshes = [];

    for (let i = 0; i < maxCards; i++) {
      const item = springCardsData[i % springCardsData.length];
      const texture = cachedTextures[i % cachedTextures.length];

      const mat = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.32,
        metalness: 0.12,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 1,
      });

      const w = item.width * 1.1;
      const h = item.height * 1.1;
      // Multi-segmented planar geometry curved along the spring cross-section
      const geom = new THREE.PlaneGeometry(w, h, 24, 16);
      updateSpringCurvedGeometry(geom, w, h, radiusRef.current);

      const mesh = new THREE.Mesh(geom, mat);
      mesh.userData = {
        w,
        h,
        baseIndex: i,
        randomScale: 0.95 + (i % 5) * 0.04, // subtle controlled organic scale variation
      };

      springGroup.add(mesh);
      cardMeshes.push(mesh);
    }

    cardMeshesRef.current = cardMeshes;

    // 8. Mouse / Touch Drag to Rotate & Wheel to Zoom
    const onMouseDown = (e) => {
      // Don't drag if clicking HUD elements
      if (e.target.closest('.image-spring-hud') || e.target.closest('.image-spring-header')) return;
      isDraggingRef.current = true;
      mousePosRef.current = { x: e.clientX, y: e.clientY };
      velocityRef.current = { x: 0, y: 0 };
    };

    const onMouseMove = (e) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - mousePosRef.current.x;
      const dy = e.clientY - mousePosRef.current.y;
      mousePosRef.current = { x: e.clientX, y: e.clientY };

      const factor = 0.005;
      springGroup.rotation.y += dx * factor;
      springGroup.rotation.x += dy * factor;
      velocityRef.current = { x: dx * factor, y: dy * factor };
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    const onWheel = (e) => {
      e.preventDefault();
      camera.position.z = Math.max(9, Math.min(30, camera.position.z + e.deltaY * 0.015));
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('wheel', onWheel, { passive: false });

    // Touch support
    let touchStart = { x: 0, y: 0 };
    const onTouchStart = (e) => {
      if (e.touches.length === 1) {
        if (e.target.closest('.image-spring-hud')) return;
        isDraggingRef.current = true;
        touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        velocityRef.current = { x: 0, y: 0 };
      }
    };

    const onTouchMove = (e) => {
      if (!isDraggingRef.current || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - touchStart.x;
      const dy = e.touches[0].clientY - touchStart.y;
      touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };

      const factor = 0.0055;
      springGroup.rotation.y += dx * factor;
      springGroup.rotation.x += dy * factor;
      velocityRef.current = { x: dx * factor, y: dy * factor };
    };

    const onTouchEnd = () => {
      isDraggingRef.current = false;
    };

    container.addEventListener('touchstart', onTouchStart);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onTouchEnd);

    // 9. Resize Handler
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // 10. 60 FPS Render Loop with Parametric Progression & Infinite Wrap
    let lastTime = performance.now();
    let accumulatedTime = 0;
    let animId;

    const tempPos = new THREE.Vector3();
    const tempQuat = new THREE.Quaternion();

    const animate = (now) => {
      animId = requestAnimationFrame(animate);

      const delta = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      if (isPlayingRef.current) {
        accumulatedTime += delta * speedRef.current * directionRef.current;
      }

      // Inertia drag decay
      if (!isDraggingRef.current) {
        velocityRef.current.x *= 0.94;
        velocityRef.current.y *= 0.94;
        springGroup.rotation.y += velocityRef.current.x;
        springGroup.rotation.x += velocityRef.current.y;
      }

      // Calculate current helical spring parameters
      const currentRadius = radiusRef.current;
      const currentPitch = pitchRef.current;
      const currentTurns = turnsRef.current;
      const activeCount = cardCountRef.current;

      const totalT = currentTurns * Math.PI * 2;
      const halfT = totalT / 2;
      const tMin = -halfT;

      const meshes = cardMeshesRef.current;

      for (let i = 0; i < meshes.length; i++) {
        const mesh = meshes[i];

        if (i < activeCount) {
          mesh.visible = true;

          // Compute continuous helical parameter with infinite modulo wrap
          const baseOffset = (i / activeCount) * totalT;
          const rawT = baseOffset + accumulatedTime;
          // Wrap into [-halfT, +halfT]
          const normT = ((((rawT - tMin) % totalT) + totalT) % totalT) + tMin;

          getHelixTransform(normT, currentRadius, currentPitch, tempPos, tempQuat);

          mesh.position.copy(tempPos);
          mesh.quaternion.copy(tempQuat);

          // Smooth edge fading & scale tapering near extremities for seamless entry/exit
          const distNorm = Math.abs(normT) / halfT; // 0 at center, 1 at ends
          let edgeAlpha = 1.0;
          if (distNorm > 0.82) {
            edgeAlpha = Math.max(0, 1 - (distNorm - 0.82) / 0.18);
          }

          mesh.material.opacity = edgeAlpha;

          // Depth prominence: cards closer to camera (higher z) are naturally larger,
          // cards at the far ends gently scale down
          const baseScale = mesh.userData.randomScale || 1.0;
          const scaleFactor = baseScale * (0.85 + (1 - distNorm) * 0.25);
          mesh.scale.setScalar(scaleFactor);
        } else {
          mesh.visible = false;
        }
      }

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('wheel', onWheel);
      container.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);

      cardMeshes.forEach((mesh) => {
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material) mesh.material.dispose();
      });
      wireGeom.dispose();
      wireMat.dispose();

      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const toggleDirection = useCallback(() => {
    setDirection((prev) => (prev === 1 ? -1 : 1));
  }, []);

  const resetView = useCallback(() => {
    if (springGroupRef.current) {
      springGroupRef.current.rotation.set(SPRING_CONFIG.cameraXAngle, SPRING_CONFIG.cameraYAngle, 0);
      velocityRef.current = { x: 0, y: 0 };
    }
  }, []);

  return (
    <div className="image-spring-container" ref={containerRef}>
      {/* Ambient Vignette Overlay */}
      <div className="image-spring-vignette" />
      <div className="image-spring-glow" />

      {/* Header Overlay */}
      <div className="image-spring-header">
        <div className="image-spring-badge">Spring Curvature • Perpendicular to Radius</div>
        <h1 className="image-spring-title">Image Spring</h1>
        <p className="image-spring-subtitle">
          Photographic cards physically curved to match the spring's cylindrical curvature, with each card surface strictly perpendicular to the radius from the central axis. Drag to rotate in 3D, scroll to zoom.
        </p>
      </div>

      {/* Floating Ambient HUD */}
      <div className="image-spring-hud">
        {/* Play/Pause */}
        <button
          className={`image-spring-hud-btn ${isPlaying ? 'active' : ''}`}
          onClick={togglePlay}
          title={isPlaying ? 'Pause Flow' : 'Resume Flow'}
        >
          {isPlaying ? '⏸ Pause' : '▶ Flow'}
        </button>

        <div className="image-spring-hud-divider" />

        {/* Direction Toggle */}
        <button
          className="image-spring-hud-btn"
          onClick={toggleDirection}
          title="Toggle Helix Direction"
        >
          {direction === 1 ? '⇄ Left → Right' : '⇆ Right → Left'}
        </button>

        <div className="image-spring-hud-divider" />

        {/* Guide Wire Toggle */}
        <button
          className={`image-spring-hud-btn ${showWireGuide ? 'active' : ''}`}
          onClick={() => setShowWireGuide((prev) => !prev)}
          title="Toggle Helix Spine Wire"
        >
          {showWireGuide ? '〰 Spring Spine' : '◌ Hide Spine'}
        </button>

        <div className="image-spring-hud-divider" />

        {/* Speed Slider */}
        <div className="image-spring-slider-group" onClick={(e) => e.stopPropagation()}>
          <span className="image-spring-hud-label">Speed:</span>
          <input
            type="range"
            min="0.2"
            max="2.2"
            step="0.1"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="image-spring-slider"
            title={`Speed: ${speed.toFixed(1)}x`}
          />
          <span className="image-spring-slider-badge">{speed.toFixed(1)}x</span>
        </div>

        <div className="image-spring-hud-divider" />

        {/* Radius Slider */}
        <div className="image-spring-slider-group" onClick={(e) => e.stopPropagation()}>
          <span className="image-spring-hud-label">Radius:</span>
          <input
            type="range"
            min="2.0"
            max="4.8"
            step="0.2"
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="image-spring-slider"
            title={`Radius: ${radius}`}
          />
          <span className="image-spring-slider-badge">{radius.toFixed(1)}</span>
        </div>

        <div className="image-spring-hud-divider" />

        {/* Pitch Slider */}
        <div className="image-spring-slider-group" onClick={(e) => e.stopPropagation()}>
          <span className="image-spring-hud-label">Pitch:</span>
          <input
            type="range"
            min="0.5"
            max="1.5"
            step="0.05"
            value={pitch}
            onChange={(e) => setPitch(Number(e.target.value))}
            className="image-spring-slider"
            title={`Pitch: ${pitch}`}
          />
          <span className="image-spring-slider-badge">{pitch.toFixed(2)}</span>
        </div>

        <div className="image-spring-hud-divider" />

        {/* Cards Count Slider */}
        <div className="image-spring-slider-group" onClick={(e) => e.stopPropagation()}>
          <span className="image-spring-hud-label">Cards:</span>
          <input
            type="range"
            min={SPRING_CONFIG.minCardCount}
            max={SPRING_CONFIG.maxCardCount}
            step="2"
            value={cardCount}
            onChange={(e) => setCardCount(Number(e.target.value))}
            className="image-spring-slider"
            title={`Card Count: ${cardCount}`}
          />
          <span className="image-spring-slider-badge">{cardCount}</span>
        </div>

        <div className="image-spring-hud-divider" />

        {/* Reset View */}
        <button
          className="image-spring-hud-btn"
          onClick={resetView}
          title="Reset 3D Angle"
        >
          ↺ Reset
        </button>
      </div>
    </div>
  );
}
