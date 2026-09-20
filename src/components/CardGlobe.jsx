import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { globeCardsData, GLOBE_CONFIG } from '../data/cardGlobeData';
import './CardGlobe.css';

/**
 * Creates high-fidelity canvas texture for a globe card.
 */
function createGlobeCardTexture(item, onLoaded) {
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
    const isCream = item.theme === 'cream-border';

    // Base card fill
    ctx.fillStyle = isPolaroid ? '#f6f5f0' : isCream ? '#ebe7dd' : '#14181f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle edge border
    ctx.strokeStyle = isPolaroid ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.18)';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);

    // Image frame with rounded corners
    const pad = isPolaroid ? 18 : isCream ? 16 : 10;
    const imgH = isPolaroid ? canvas.height - 115 : canvas.height - 85;
    const imgW = canvas.width - pad * 2;

    if (img && img.complete && img.naturalWidth !== 0) {
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(pad, pad, imgW, imgH, 14);
      ctx.clip();

      const scale = Math.max(imgW / img.naturalWidth, imgH / img.naturalHeight);
      const sw = img.naturalWidth * scale;
      const sh = img.naturalHeight * scale;
      const sx = pad + (imgW - sw) / 2;
      const sy = pad + (imgH - sh) / 2;

      ctx.drawImage(img, sx, sy, sw, sh);

      // Subtle lighting gradient
      const grad = ctx.createLinearGradient(pad, pad, pad + imgW, pad + imgH);
      grad.addColorStop(0, 'rgba(255,255,255,0.16)');
      grad.addColorStop(0.3, 'rgba(255,255,255,0.02)');
      grad.addColorStop(0.7, 'rgba(0,0,0,0.18)');
      ctx.fillStyle = grad;
      ctx.fillRect(pad, pad, imgW, imgH);
      ctx.restore();
    } else {
      ctx.fillStyle = '#1e242d';
      ctx.fillRect(pad, pad, imgW, imgH);
    }

    // Typography
    const textColor = isPolaroid || isCream ? '#1a1e24' : '#eaf0f8';
    const subColor = isPolaroid || isCream ? '#6e7682' : '#8a99aa';

    ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = textColor;
    ctx.fillText(item.title, pad + 4, canvas.height - 50);

    ctx.font = '13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace';
    ctx.fillStyle = subColor;
    ctx.fillText(item.category, pad + 4, canvas.height - 24);

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
 * Calculates Fibonacci sphere coordinates.
 */
function getFibonacciPoint(i, count, radius) {
  const phi = Math.acos(1 - (2 * (i + 0.5)) / count);
  const theta = Math.PI * (1 + Math.sqrt(5)) * i;

  const x = radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  return { x, y, z };
}

/**
 * Updates vertex positions and normals so that the planar card
 * physically bends to match the exact spherical curvature of a globe of radius `radius`.
 * In world space, every vertex on the curved card satisfies:
 *   X^2 + Y^2 + Z^2 = radius^2
 */
function updateCurvedGeometryVertices(geom, w, h, radius, curvatureFactor = 1.0, segX = 24, segY = 24) {
  const posAttr = geom.attributes.position;
  const normAttr = geom.attributes.normal;
  const count = posAttr.count;

  for (let i = 0; i < count; i++) {
    const col = i % (segX + 1);
    const row = Math.floor(i / (segX + 1));
    const u = (col / segX - 0.5) * w;
    const v = (0.5 - row / segY) * h;

    if (curvatureFactor <= 0.001) {
      posAttr.setXYZ(i, u, v, 0);
      normAttr.setXYZ(i, 0, 0, 1);
    } else {
      const effRadius = radius / curvatureFactor;
      const thetaX = u / effRadius;
      const thetaY = v / effRadius;

      const cosY = Math.cos(thetaY);
      const sinY = Math.sin(thetaY);
      const cosX = Math.cos(thetaX);
      const sinX = Math.sin(thetaX);

      // Normal vector pointing radially outward from sphere center at (0, 0, -effRadius)
      const nx = sinX * cosY;
      const ny = sinY;
      const nz = cosX * cosY;

      // Position in card local space (origin at sphere surface)
      // Bends backward along -Z toward the center of the globe
      const px = effRadius * nx;
      const py = effRadius * ny;
      const pz = effRadius * (nz - 1);

      posAttr.setXYZ(i, px, py, pz);
      normAttr.setXYZ(i, nx, ny, nz);
    }
  }

  posAttr.needsUpdate = true;
  normAttr.needsUpdate = true;
  geom.computeBoundingSphere();
}

/**
 * Factory for creating a curved card geometry conforming to the globe curvature.
 */
function createCurvedCardGeometry(w, h, radius, curvatureFactor = 1.0, segX = 24, segY = 24) {
  const geom = new THREE.PlaneGeometry(w, h, segX, segY);
  updateCurvedGeometryVertices(geom, w, h, radius, curvatureFactor, segX, segY);
  return geom;
}

const CardGlobe = () => {
  const containerRef = useRef(null);

  // HUD & Interaction State
  const [isPlaying, setIsPlaying] = useState(true);
  const [rotationSpeed, setRotationSpeed] = useState(1.0);
  const [cardCount, setCardCount] = useState(GLOBE_CONFIG.defaultCardCount);
  const [globeRadius, setGlobeRadius] = useState(GLOBE_CONFIG.defaultRadius);
  const [hasCore, setHasCore] = useState(true);
  const [isCurved, setIsCurved] = useState(true);

  // Mutable refs for 60fps RAF loop
  const isPlayingRef = useRef(isPlaying);
  const speedRef = useRef(rotationSpeed);
  const cardCountRef = useRef(cardCount);
  const globeRadiusRef = useRef(globeRadius);
  const hasCoreRef = useRef(hasCore);
  const isCurvedRef = useRef(isCurved);

  const globeGroupRef = useRef(null);
  const cardMeshesRef = useRef([]);
  const coreMeshRef = useRef(null);

  // Drag interaction refs
  const isDraggingRef = useRef(false);
  const mousePosRef = useRef({ x: 0, y: 0 });
  const velocityRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    isPlayingRef.current = isPlaying;
    speedRef.current = rotationSpeed;
    cardCountRef.current = cardCount;
    globeRadiusRef.current = globeRadius;
    hasCoreRef.current = hasCore;
    isCurvedRef.current = isCurved;
  }, [isPlaying, rotationSpeed, cardCount, globeRadius, hasCore, isCurved]);

  // Update card positions and spherical curvature whenever parameters change
  const updateGlobePositions = useCallback((count, radius, curved = true) => {
    const meshes = cardMeshesRef.current;
    if (!meshes.length) return;

    const factor = curved ? 1.0 : 0.0;

    for (let i = 0; i < meshes.length; i++) {
      const mesh = meshes[i];
      if (i < count) {
        mesh.visible = true;
        const pt = getFibonacciPoint(i, count, radius);
        mesh.position.set(pt.x, pt.y, pt.z);

        // Orient card tangent to sphere surface (normal points outward)
        mesh.lookAt(pt.x * 2, pt.y * 2, pt.z * 2);

        // Conform geometry to the exact curvature of the globe
        if (mesh.userData && mesh.userData.w && mesh.userData.h) {
          updateCurvedGeometryVertices(mesh.geometry, mesh.userData.w, mesh.userData.h, radius, factor);
        }
      } else {
        mesh.visible = false;
      }
    }

    if (coreMeshRef.current) {
      coreMeshRef.current.scale.setScalar(radius * 0.94);
      coreMeshRef.current.visible = hasCoreRef.current;
    }
  }, []);

  useEffect(() => {
    updateGlobePositions(cardCount, globeRadius, isCurved);
  }, [cardCount, globeRadius, isCurved, updateGlobePositions]);

  useEffect(() => {
    if (coreMeshRef.current) {
      coreMeshRef.current.visible = hasCore;
    }
  }, [hasCore]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // 1. Three.js Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x090a0d);

    const camera = new THREE.PerspectiveCamera(
      GLOBE_CONFIG.cameraFOV,
      width / height,
      0.1,
      100
    );
    camera.position.set(0, 0, GLOBE_CONFIG.cameraDistance);

    // 2. High-Performance WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // 3. Lighting: Ambient + Key + Rim Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xf2f7ff, 2.2);
    keyLight.position.set(8, 10, 12);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x8fa4c0, 1.2);
    fillLight.position.set(-8, -6, -8);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0x64d2ff, 2.5, 30);
    rimLight.position.set(0, 12, 5);
    scene.add(rimLight);

    // 4. Globe Group Anchor with subtle natural axial tilt (~12 deg)
    const globeGroup = new THREE.Group();
    globeGroup.rotation.z = 0.16;
    globeGroup.rotation.x = 0.10;
    scene.add(globeGroup);
    globeGroupRef.current = globeGroup;

    // 5. Subtle Dark Core Sphere (Accentuates 3D volume & occludes far-back cards)
    const coreGeom = new THREE.SphereGeometry(1, 36, 36);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x080a0e,
      roughness: 0.9,
      metalness: 0.1,
      transparent: true,
      opacity: 0.92,
    });
    const coreMesh = new THREE.Mesh(coreGeom, coreMat);
    coreMesh.scale.setScalar(globeRadiusRef.current * 0.94);
    coreMesh.visible = hasCoreRef.current;
    globeGroup.add(coreMesh);
    coreMeshRef.current = coreMesh;

    // 6. Pre-cache Textures
    const cachedTextures = globeCardsData.map((item) =>
      createGlobeCardTexture(item, () => {
        renderer.render(scene, camera);
      })
    );

    // 7. Instantiate Maximum Card Mesh Pool (64 cards) with physical spherical curvature
    const maxCards = GLOBE_CONFIG.maxCardCount;
    const cardMeshes = [];

    for (let i = 0; i < maxCards; i++) {
      const item = globeCardsData[i % globeCardsData.length];
      const texture = cachedTextures[i % cachedTextures.length];

      const mat = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.35,
        metalness: 0.1,
        side: THREE.DoubleSide,
      });

      const w = item.width * 1.05;
      const h = item.height * 1.05;
      const geom = createCurvedCardGeometry(
        w,
        h,
        globeRadiusRef.current,
        isCurvedRef.current ? 1.0 : 0.0,
        24,
        24
      );

      const mesh = new THREE.Mesh(geom, mat);
      mesh.userData = { w, h };
      globeGroup.add(mesh);
      cardMeshes.push(mesh);
    }

    cardMeshesRef.current = cardMeshes;
    updateGlobePositions(cardCountRef.current, globeRadiusRef.current, isCurvedRef.current);

    // 8. Interactive Drag to Rotate & Momentum
    const onMouseDown = (e) => {
      isDraggingRef.current = true;
      mousePosRef.current = { x: e.clientX, y: e.clientY };
      velocityRef.current = { x: 0, y: 0 };
    };

    const onMouseMove = (e) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - mousePosRef.current.x;
      const dy = e.clientY - mousePosRef.current.y;
      mousePosRef.current = { x: e.clientX, y: e.clientY };

      const rotFactor = 0.0055;
      globeGroup.rotation.y += dx * rotFactor;
      globeGroup.rotation.x += dy * rotFactor;

      velocityRef.current = { x: dx * rotFactor, y: dy * rotFactor };
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    // Zoom via Wheel
    const onWheel = (e) => {
      e.preventDefault();
      camera.position.z = Math.max(8.5, Math.min(22, camera.position.z + e.deltaY * 0.012));
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('wheel', onWheel, { passive: false });

    // Touch handlers for mobile
    let touchStart = { x: 0, y: 0 };
    const onTouchStart = (e) => {
      if (e.touches.length === 1) {
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

      const rotFactor = 0.006;
      globeGroup.rotation.y += dx * rotFactor;
      globeGroup.rotation.x += dy * rotFactor;
      velocityRef.current = { x: dx * rotFactor, y: dy * rotFactor };
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

    // 10. 60 FPS Render Loop
    let lastTime = performance.now();
    let animId;

    const animate = (now) => {
      animId = requestAnimationFrame(animate);

      const delta = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      // Inertial momentum dampening
      if (!isDraggingRef.current) {
        velocityRef.current.x *= 0.94;
        velocityRef.current.y *= 0.94;
        globeGroup.rotation.y += velocityRef.current.x;
        globeGroup.rotation.x += velocityRef.current.y;

        // Continuous ambient rotation around Y
        if (isPlayingRef.current) {
          const autoSpeed = GLOBE_CONFIG.baseRotationSpeed * speedRef.current;
          globeGroup.rotation.y += autoSpeed * delta;
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
      coreGeom.dispose();
      coreMat.dispose();

      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [updateGlobePositions]);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const resetView = useCallback(() => {
    if (globeGroupRef.current) {
      globeGroupRef.current.rotation.set(0.1, 0, 0.16);
      velocityRef.current = { x: 0, y: 0 };
    }
  }, []);

  return (
    <div className="card-globe-container" ref={containerRef}>
      {/* Ambient Lighting Vignette */}
      <div className="card-globe-vignette" />
      <div className="card-globe-ambient-glow" />

      {/* Header Overlay */}
      <div className="card-globe-header">
        <div className="card-globe-badge">Spherical Curvature • Fibonacci Lattice</div>
        <h1 className="card-globe-title">Card Globe</h1>
        <p className="card-globe-subtitle">
          Photographic cards individually curved to match the spherical surface of the rotating globe. Drag to rotate in any direction.
        </p>
      </div>

      {/* Floating Ambient HUD */}
      <div className="card-globe-hud">
        {/* Play/Pause Button */}
        <button
          className={`card-globe-hud-btn ${isPlaying ? 'active' : ''}`}
          onClick={togglePlay}
          title={isPlaying ? 'Pause Rotation' : 'Resume Rotation'}
        >
          {isPlaying ? '⏸ Pause' : '▶ Rotate'}
        </button>

        <div className="card-globe-hud-divider" />

        {/* Spherical Curvature Toggle */}
        <button
          className={`card-globe-hud-btn ${isCurved ? 'active' : ''}`}
          onClick={() => setIsCurved((prev) => !prev)}
          title="Toggle Image Curvature (conforms image cards to sphere surface)"
        >
          {isCurved ? '🌐 Spherical Curve' : '⬛ Flat Cards'}
        </button>

        <div className="card-globe-hud-divider" />

        {/* Speed Slider */}
        <div className="card-globe-slider-group" onClick={(e) => e.stopPropagation()}>
          <span className="card-globe-hud-label">Speed:</span>
          <input
            type="range"
            min="0.2"
            max="2.5"
            step="0.1"
            value={rotationSpeed}
            onChange={(e) => setRotationSpeed(Number(e.target.value))}
            className="card-globe-slider"
            title={`Speed: ${rotationSpeed}x`}
          />
          <span className="card-globe-slider-badge">{rotationSpeed}x</span>
        </div>

        <div className="card-globe-hud-divider" />

        {/* Card Count / Density Slider */}
        <div className="card-globe-slider-group" onClick={(e) => e.stopPropagation()}>
          <span className="card-globe-hud-label">Cards:</span>
          <input
            type="range"
            min={GLOBE_CONFIG.minCardCount}
            max={GLOBE_CONFIG.maxCardCount}
            step="2"
            value={cardCount}
            onChange={(e) => setCardCount(Number(e.target.value))}
            className="card-globe-slider"
            title={`Card Count: ${cardCount}`}
          />
          <span className="card-globe-slider-badge">{cardCount}</span>
        </div>

        <div className="card-globe-hud-divider" />

        {/* Sphere Radius Slider */}
        <div className="card-globe-slider-group" onClick={(e) => e.stopPropagation()}>
          <span className="card-globe-hud-label">Radius:</span>
          <input
            type="range"
            min="4.2"
            max="7.2"
            step="0.2"
            value={globeRadius}
            onChange={(e) => setGlobeRadius(Number(e.target.value))}
            className="card-globe-slider"
            title={`Radius: ${globeRadius}`}
          />
          <span className="card-globe-slider-badge">{globeRadius.toFixed(1)}</span>
        </div>

        <div className="card-globe-hud-divider" />

        {/* Dark Core Occlusion Toggle */}
        <button
          className={`card-globe-hud-btn ${hasCore ? 'active' : ''}`}
          onClick={() => setHasCore((prev) => !prev)}
          title="Toggle Dark Interior Core (enhances spherical occlusion)"
        >
          {hasCore ? '🌑 Core On' : '⚪ Hollow'}
        </button>

        {/* Reset View Button */}
        <button
          className="card-globe-hud-btn"
          onClick={resetView}
          title="Reset Orientation"
        >
          ↺ Reset
        </button>
      </div>
    </div>
  );
};

export default CardGlobe;
