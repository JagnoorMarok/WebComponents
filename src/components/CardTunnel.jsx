import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { tunnelCardsData, TUNNEL_CONFIG } from '../data/cardTunnelData';
import './CardTunnel.css';

/**
 * Creates high-fidelity canvas texture for a tunnel card.
 */
function createTunnelCardTexture(item, onLoaded) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 680;
  const ctx = canvas.getContext('2d');

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;

  const render = (img) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Card background base
    const isPolaroid = item.theme === 'polaroid';
    const isCream = item.theme === 'cream-border';
    ctx.fillStyle = isPolaroid ? '#f7f6f2' : isCream ? '#ebe7dd' : '#14181f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Card border
    ctx.strokeStyle = isPolaroid ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);

    // Image frame
    const pad = isPolaroid ? 20 : isCream ? 18 : 12;
    const imgH = isPolaroid ? canvas.height - 130 : canvas.height - 100;
    const imgW = canvas.width - pad * 2;

    if (img && img.complete && img.naturalWidth !== 0) {
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(pad, pad, imgW, imgH, 16);
      ctx.clip();

      const scale = Math.max(imgW / img.naturalWidth, imgH / img.naturalHeight);
      const sw = img.naturalWidth * scale;
      const sh = img.naturalHeight * scale;
      const sx = pad + (imgW - sw) / 2;
      const sy = pad + (imgH - sh) / 2;

      ctx.drawImage(img, sx, sy, sw, sh);

      // Subtle gloss sheen
      const grad = ctx.createLinearGradient(pad, pad, pad + imgW, pad + imgH);
      grad.addColorStop(0, 'rgba(255,255,255,0.18)');
      grad.addColorStop(0.35, 'rgba(255,255,255,0.03)');
      grad.addColorStop(0.7, 'rgba(0,0,0,0.15)');
      ctx.fillStyle = grad;
      ctx.fillRect(pad, pad, imgW, imgH);
      ctx.restore();
    } else {
      ctx.fillStyle = '#222832';
      ctx.fillRect(pad, pad, imgW, imgH);
    }

    // Editorial Typography
    const textColor = isPolaroid || isCream ? '#1a1e24' : '#eaf0f8';
    const subColor = isPolaroid || isCream ? '#6e7682' : '#8a99aa';

    ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = textColor;
    ctx.fillText(item.title, pad + 6, canvas.height - 58);

    ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace';
    ctx.fillStyle = subColor;
    ctx.fillText(`${item.category} • ${item.caption}`, pad + 6, canvas.height - 28);

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
 * Positions and rotates a card to attach to one of the 4 square tunnel walls:
 * - left: x = -W/2, facing +X (rotation.y = Math.PI / 2)
 * - right: x = +W/2, facing -X (rotation.y = -Math.PI / 2)
 * - top: y = +H/2, facing -Y (rotation.x = Math.PI / 2)
 * - bottom: y = -H/2, facing +Y (rotation.x = -Math.PI / 2)
 */
/**
 * Positions and scales all meshes according to the current wall density (lanes) and coverage ratio.
 */
function updateTunnelGrid(meshes, lanes, coverage) {
  const tunnelW = TUNNEL_CONFIG.tunnelWidth; // 10
  const tunnelH = TUNNEL_CONFIG.tunnelHeight; // 10
  const tunnelL = TUNNEL_CONFIG.tunnelLength; // 120
  const rows = 12;
  const rowDepth = tunnelL / rows; // 10 units per depth slice

  // When coverage is 1.0 (Full Wall), cards seamlessly touch each other
  const l_card = rowDepth * coverage;

  let meshIndex = 0;
  for (let w = 0; w < 4; w++) {
    for (let c = 0; c < 3; c++) {
      const isLaneActive = c < lanes;
      const laneWidth = (w < 2 ? tunnelH : tunnelW) / lanes; // 10 / lanes
      const u_c = -5 + (c + 0.5) * laneWidth;
      const w_card = laneWidth * coverage;

      for (let r = 0; r < rows; r++) {
        const mesh = meshes[meshIndex++];
        if (!mesh) continue;

        if (!isLaneActive) {
          mesh.visible = false;
          continue;
        }

        mesh.visible = true;

        if (w === 0) {
          // LEFT Wall (x = -5): facing +X
          mesh.position.x = -5 + 0.02;
          mesh.position.y = u_c;
          mesh.rotation.set(0, Math.PI / 2, 0);
          mesh.scale.set(l_card, w_card, 1);
        } else if (w === 1) {
          // RIGHT Wall (x = +5): facing -X
          mesh.position.x = +5 - 0.02;
          mesh.position.y = u_c;
          mesh.rotation.set(0, -Math.PI / 2, 0);
          mesh.scale.set(l_card, w_card, 1);
        } else if (w === 2) {
          // TOP Wall (y = +5): facing -Y
          mesh.position.x = u_c;
          mesh.position.y = +5 - 0.02;
          mesh.rotation.set(Math.PI / 2, 0, 0);
          mesh.scale.set(w_card, l_card, 1);
        } else {
          // BOTTOM Wall (y = -5): facing +Y
          mesh.position.x = u_c;
          mesh.position.y = -5 + 0.02;
          mesh.rotation.set(-Math.PI / 2, 0, 0);
          mesh.scale.set(w_card, l_card, 1);
        }
      }
    }
  }
}

const CardTunnel = () => {
  const containerRef = useRef(null);

  // HUD & Interaction State
  const [isPlaying, setIsPlaying] = useState(true);
  const [speedMultiplier, setSpeedMultiplier] = useState(1.0);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = reverse
  const [isTurbo, setIsTurbo] = useState(false);
  const [fovMode, setFovMode] = useState('normal'); // 'normal' (70), 'wide' (85), 'cinematic' (55)

  // Wall Density & Full Wall Coverage States
  const [lanesPerWall, setLanesPerWall] = useState(2); // 1, 2, or 3 lanes per wall
  const [coverageRatio, setCoverageRatio] = useState(1.0); // 1.0 = Full Wall Coverage (100%), down to 0.65

  // Mutable refs for 60fps RAF loop
  const isPlayingRef = useRef(isPlaying);
  const speedRef = useRef(speedMultiplier);
  const dirRef = useRef(direction);
  const isTurboRef = useRef(isTurbo);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const cardMeshesRef = useRef([]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
    speedRef.current = speedMultiplier;
    dirRef.current = direction;
    isTurboRef.current = isTurbo;
  }, [isPlaying, speedMultiplier, direction, isTurbo]);

  // Synchronize wall density and coverage ratio on active meshes
  useEffect(() => {
    if (cardMeshesRef.current.length > 0) {
      updateTunnelGrid(cardMeshesRef.current, lanesPerWall, coverageRatio);
    }
  }, [lanesPerWall, coverageRatio]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // 1. Scene & Perspective Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(TUNNEL_CONFIG.fogColor);
    scene.fog = new THREE.Fog(TUNNEL_CONFIG.fogColor, TUNNEL_CONFIG.fogNear, TUNNEL_CONFIG.fogFar);

    const getBaseFov = (w, h) => {
      const modeFov = fovMode === 'wide' ? 85 : fovMode === 'cinematic' ? 55 : 70;
      return w < h ? Math.min(95, modeFov + 12) : modeFov;
    };

    const initialFov = getBaseFov(width, height);
    const camera = new THREE.PerspectiveCamera(initialFov, width / height, 0.1, 250);
    camera.position.set(0, 0, 0);

    // 2. High-Performance WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // 3. Ambient & Traveling Headlight
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);

    const headlight = new THREE.PointLight(0xf4f8ff, 4.0, 60, 1.1);
    headlight.position.set(0, 0, 3);
    scene.add(headlight);

    // 4. Subtle Square Tunnel Guide Rings
    const tunnelW = TUNNEL_CONFIG.tunnelWidth;
    const tunnelH = TUNNEL_CONFIG.tunnelHeight;
    const tunnelL = TUNNEL_CONFIG.tunnelLength;

    const ringCount = 15;
    const ringSpacing = tunnelL / ringCount; // 8 units
    const rings = [];

    const ringGeom = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-tunnelW / 2, -tunnelH / 2, 0),
      new THREE.Vector3(tunnelW / 2, -tunnelH / 2, 0),
      new THREE.Vector3(tunnelW / 2, tunnelH / 2, 0),
      new THREE.Vector3(-tunnelW / 2, tunnelH / 2, 0),
      new THREE.Vector3(-tunnelW / 2, -tunnelH / 2, 0),
    ]);

    const ringMat = new THREE.LineBasicMaterial({
      color: 0x273445,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });

    for (let i = 0; i < ringCount; i++) {
      const line = new THREE.Line(ringGeom, ringMat);
      line.position.z = -i * ringSpacing;
      scene.add(line);
      rings.push(line);
    }

    // 5. Pre-cache textures for the 16 cards to eliminate GPU memory overhead
    const cachedTextures = tunnelCardsData.map((item) =>
      createTunnelCardTexture(item, () => {
        renderer.render(scene, camera);
      })
    );

    // 6. Instantiate 144 Fixed Mesh Pool (4 walls x 3 lanes max x 12 depth rows)
    const cardMeshes = [];
    const rows = 12;
    const rowDepth = tunnelL / rows; // 10
    const geom = new THREE.PlaneGeometry(1, 1);

    let idx = 0;
    for (let w = 0; w < 4; w++) {
      for (let c = 0; c < 3; c++) {
        for (let r = 0; r < rows; r++) {
          const texture = cachedTextures[idx % cachedTextures.length];
          const mat = new THREE.MeshStandardMaterial({
            map: texture,
            roughness: 0.3,
            metalness: 0.1,
            side: THREE.DoubleSide,
          });

          const mesh = new THREE.Mesh(geom, mat);
          mesh.position.z = -r * rowDepth;

          scene.add(mesh);
          cardMeshes.push(mesh);
          idx++;
        }
      }
    }

    cardMeshesRef.current = cardMeshes;
    updateTunnelGrid(cardMeshes, lanesPerWall, coverageRatio);

    // 7. Smooth Mouse Parallax Handler
    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / height) * 2 - 1);
      mouseRef.current.targetX = nx;
      mouseRef.current.targetY = ny;
    };

    const handleTouch = (e) => {
      if (e.touches && e.touches.length > 0) {
        const touch = e.touches[0];
        const rect = container.getBoundingClientRect();
        const nx = ((touch.clientX - rect.left) / width) * 2 - 1;
        const ny = -(((touch.clientY - rect.top) / height) * 2 - 1);
        mouseRef.current.targetX = Math.max(-1.5, Math.min(1.5, nx));
        mouseRef.current.targetY = Math.max(-1.5, Math.min(1.5, ny));
      }
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('touchstart', handleTouch, { passive: true });
    container.addEventListener('touchmove', handleTouch, { passive: true });

    // 8. Window Resize Handler
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight;
      camera.fov = getBaseFov(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // 9. 60 FPS Infinite Forward Travel Animation Loop
    let clock = new THREE.Clock();
    let animId;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      const delta = Math.min(clock.getDelta(), 0.05);

      if (isPlayingRef.current) {
        const turboFactor = isTurboRef.current ? 2.5 : 1.0;
        const currentSpeed = TUNNEL_CONFIG.baseSpeed * speedRef.current * dirRef.current * turboFactor;
        const zMove = currentSpeed * delta;

        // Move cards forward down the square tunnel
        cardMeshes.forEach((mesh) => {
          if (!mesh.visible) return;
          mesh.position.z += zMove;

          // Infinite Seamless Wrap-Around
          if (dirRef.current >= 0 && mesh.position.z > 5) {
            mesh.position.z -= tunnelL;
          } else if (dirRef.current < 0 && mesh.position.z < -tunnelL + 5) {
            mesh.position.z += tunnelL;
          }
        });

        // Move square guide rings
        rings.forEach((ring) => {
          ring.position.z += zMove;
          if (dirRef.current >= 0 && ring.position.z > 2) {
            ring.position.z -= tunnelL;
          } else if (dirRef.current < 0 && ring.position.z < -tunnelL) {
            ring.position.z += tunnelL;
          }
        });
      }

      // Smooth camera sway based on mouse
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.06;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.06;

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      // Camera position sways gently inside square corridor
      camera.position.x = mx * 1.1;
      camera.position.y = my * 1.1;
      camera.rotation.z = -mx * 0.035;

      // Look slightly down the center line
      camera.lookAt(mx * 0.6, my * 0.6, -45);

      // Headlight follows camera
      headlight.position.x = camera.position.x;
      headlight.position.y = camera.position.y;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('touchstart', handleTouch);
      container.removeEventListener('touchmove', handleTouch);
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [fovMode]);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const toggleDirection = useCallback(() => {
    setDirection((prev) => (prev === 1 ? -1 : 1));
  }, []);

  const toggleTurbo = useCallback(() => {
    setIsTurbo((prev) => !prev);
  }, []);

  const cycleFov = useCallback(() => {
    setFovMode((prev) => (prev === 'normal' ? 'wide' : prev === 'wide' ? 'cinematic' : 'normal'));
  }, []);

  return (
    <div className="card-tunnel-container" ref={containerRef}>
      {/* Header Overlay */}
      <div className="card-tunnel-header">
        <div className="card-tunnel-badge">
          {coverageRatio === 1.0 ? 'Full Wall Clad Corridor' : 'Architectural Perspective Tunnel'}
        </div>
        <h1 className="card-tunnel-title">Infinite Square Tunnel</h1>
        <p className="card-tunnel-subtitle">
          {coverageRatio === 1.0
            ? 'Continuous 3D gallery completely covering all 4 square walls from floor to ceiling'
            : 'Continuous 3D perspective camera voyage through a 4-walled image corridor'}
        </p>
      </div>

      {/* Crosshair / Vanishing Point Indicator */}
      <div className="card-tunnel-crosshair">
        <div className="crosshair-h" />
        <div className="crosshair-v" />
        <div className="crosshair-square" />
      </div>

      {/* Floating Ambient HUD */}
      <div className="card-tunnel-hud">
        {/* Play/Pause Button */}
        <button
          className={`card-tunnel-hud-btn ${isPlaying ? 'active' : ''}`}
          onClick={togglePlay}
          title={isPlaying ? 'Pause Voyage' : 'Resume Voyage'}
        >
          {isPlaying ? '⏸ Pause' : '▶ Travel'}
        </button>

        <div className="card-tunnel-hud-divider" />

        {/* Wall Density Selector (Lanes per Wall) */}
        <div className="card-tunnel-density-group">
          <span className="card-tunnel-hud-label">Density:</span>
          {[1, 2, 3].map((lanes) => (
            <button
              key={lanes}
              className={`card-tunnel-pill ${lanesPerWall === lanes ? 'selected' : ''}`}
              onClick={() => setLanesPerWall(lanes)}
              title={`${lanes} lane${lanes > 1 ? 's' : ''} per wall`}
            >
              {lanes}x
            </button>
          ))}
        </div>

        <div className="card-tunnel-hud-divider" />

        {/* Wall Coverage Slider / Presets */}
        <div className="card-tunnel-coverage-group" onClick={(e) => e.stopPropagation()}>
          <span className="card-tunnel-hud-label">Coverage:</span>
          <input
            type="range"
            min="0.65"
            max="1.0"
            step="0.01"
            value={coverageRatio}
            onChange={(e) => setCoverageRatio(Number(e.target.value))}
            className="card-tunnel-slider"
            title={`Wall coverage: ${Math.round(coverageRatio * 100)}%`}
          />
          <button
            className={`card-tunnel-pill ${coverageRatio >= 0.99 ? 'selected full-wall' : ''}`}
            onClick={() => setCoverageRatio(1.0)}
            title="Cover Full Walls (100% Seamless)"
          >
            {coverageRatio >= 0.99 ? '★ Full Wall' : `${Math.round(coverageRatio * 100)}%`}
          </button>
        </div>

        <div className="card-tunnel-hud-divider" />

        {/* Speed Slider */}
        <div className="card-tunnel-slider-group" onClick={(e) => e.stopPropagation()}>
          <span className="card-tunnel-hud-label">Speed:</span>
          <input
            type="range"
            min="0.3"
            max="2.5"
            step="0.1"
            value={speedMultiplier}
            onChange={(e) => setSpeedMultiplier(Number(e.target.value))}
            className="card-tunnel-slider"
            title={`Speed: ${speedMultiplier}x`}
          />
          <span className="card-tunnel-slider-badge">{speedMultiplier}x</span>
        </div>

        <div className="card-tunnel-hud-divider" />

        {/* Direction Flip */}
        <button
          className={`card-tunnel-hud-btn ${direction === -1 ? 'active' : ''}`}
          onClick={toggleDirection}
          title="Reverse Travel Direction"
        >
          {direction === 1 ? '↓ Fwd' : '↑ Rev'}
        </button>

        {/* Turbo Boost */}
        <button
          className={`card-tunnel-hud-btn turbo-btn ${isTurbo ? 'active' : ''}`}
          onClick={toggleTurbo}
          title="Toggle Turbo Cruise"
        >
          ⚡ Turbo
        </button>

        <div className="card-tunnel-hud-divider" />

        {/* FOV Mode */}
        <button
          className="card-tunnel-hud-btn"
          onClick={cycleFov}
          title="Toggle Camera Lens FOV"
        >
          🔍 {fovMode.toUpperCase()}
        </button>
      </div>
    </div>
  );
};

export default CardTunnel;
