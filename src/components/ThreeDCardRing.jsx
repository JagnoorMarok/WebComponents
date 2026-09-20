import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import cardRingData from '../data/cardRingData';
import './ThreeDCardRing.css';

/**
 * Creates a rounded rectangle THREE.Shape
 */
function createRoundedRectShape(width, height, radius) {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;
  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);
  return shape;
}

/**
 * Renders a card onto a 2D Canvas with rounded corners, gradient overlay, and typography,
 * returning a THREE.CanvasTexture.
 */
function createCardTexture(item, onUpdate) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 768;
  const ctx = canvas.getContext('2d');

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;

  const renderContent = (img) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Card frame fill with dark olive-charcoal base
    ctx.fillStyle = '#121614';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Inner rounded clipping path for image
    const pad = 14;
    const innerW = canvas.width - pad * 2;
    const innerH = canvas.height - pad * 2;
    const cornerR = 36;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(pad, pad, innerW, innerH, cornerR);
    ctx.clip();

    if (img && img.complete && img.naturalWidth !== 0) {
      // Draw image cover-fit
      const imgAspect = img.naturalWidth / img.naturalHeight;
      const targetAspect = innerW / innerH;
      let drawW, drawH, drawX, drawY;

      if (imgAspect > targetAspect) {
        drawH = innerH;
        drawW = innerH * imgAspect;
        drawX = pad - (drawW - innerW) / 2;
        drawY = pad;
      } else {
        drawW = innerW;
        drawH = innerW / imgAspect;
        drawX = pad;
        drawY = pad - (drawH - innerH) / 2;
      }
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
    } else {
      // Fallback gradient placeholder
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0, '#1d2a22');
      grad.addColorStop(0.5, '#151d18');
      grad.addColorStop(1, '#0e120f');
      ctx.fillStyle = grad;
      ctx.fillRect(pad, pad, innerW, innerH);
    }

    // Cinematic dark vignette gradient from bottom
    const gradVignette = ctx.createLinearGradient(0, canvas.height * 0.4, 0, canvas.height);
    gradVignette.addColorStop(0, 'rgba(7, 9, 8, 0)');
    gradVignette.addColorStop(0.65, 'rgba(7, 9, 8, 0.65)');
    gradVignette.addColorStop(1, 'rgba(7, 9, 8, 0.95)');
    ctx.fillStyle = gradVignette;
    ctx.fillRect(pad, pad, innerW, innerH);

    // Category Pill Badge
    const badgeX = pad + 24;
    const badgeY = canvas.height - 150;
    const badgeW = ctx.measureText(item.category.toUpperCase()).width + 28;
    const badgeH = 32;

    ctx.fillStyle = 'rgba(28, 38, 32, 0.85)';
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 16);
    ctx.fill();
    ctx.strokeStyle = 'rgba(158, 187, 164, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#a6cbb0';
    ctx.font = '600 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(item.category.toUpperCase(), badgeX + 14, badgeY + 21);

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(item.title, pad + 24, canvas.height - 88);

    // Subtitle
    ctx.fillStyle = '#8f9f93';
    ctx.font = '500 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(item.subtitle, pad + 24, canvas.height - 52);

    ctx.restore();

    // Subtle outer metallic frame border
    ctx.strokeStyle = 'rgba(135, 155, 138, 0.35)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(pad, pad, innerW, innerH, cornerR);
    ctx.stroke();

    texture.needsUpdate = true;
    if (onUpdate) onUpdate();
  };

  // Pre-render placeholder immediately
  renderContent(null);

  // Load actual image
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => renderContent(img);
  img.onerror = () => renderContent(null);
  img.src = item.image;

  return texture;
}

const ThreeDCardRing = ({
  cards = cardRingData,
  cardWidth = 1.6,
  cardHeight = 2.4,
  ringRadius = 4.8,
  rotationSpeed = 0.003,
  tiltAngle = -0.22, // in radians (~ -12.6 deg)
  perspective = 42,
  pauseOnHover = true,
  interactive = true,
}) => {
  const mountRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [activeCardInfo, setActiveCardInfo] = useState(null);
  const [zoomPercent, setZoomPercent] = useState(100);

  // Refs for animation loop & interactions
  const isPlayingRef = useRef(isPlaying);
  const speedRef = useRef(speedMultiplier);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
    speedRef.current = speedMultiplier;
  }, [isPlaying, speedMultiplier]);

  const isDraggingRef = useRef(false);
  const pointerStartRef = useRef({ x: 0, y: 0 });
  const isHoveredRef = useRef(false);

  // Dynamic Camera Distance (Zoom)
  const defaultDistance = 7.8;
  const minDistance = 4.2;
  const maxDistance = 14.0;
  const targetDistanceRef = useRef(defaultDistance);
  const currentDistanceRef = useRef(defaultDistance);

  // Dynamic 2-Axis Rotation
  const targetRotationYRef = useRef(0);
  const currentRotationYRef = useRef(0);
  const targetTiltXRef = useRef(tiltAngle);
  const currentTiltXRef = useRef(tiltAngle);

  // Direct action callbacks
  const handleZoomIn = useCallback(() => {
    targetDistanceRef.current = Math.max(minDistance, targetDistanceRef.current - 1.2);
  }, []);

  const handleZoomOut = useCallback(() => {
    targetDistanceRef.current = Math.min(maxDistance, targetDistanceRef.current + 1.2);
  }, []);

  const handleRotateLeft = useCallback(() => {
    targetRotationYRef.current -= 0.45;
  }, []);

  const handleRotateRight = useCallback(() => {
    targetRotationYRef.current += 0.45;
  }, []);

  const handleResetView = useCallback(() => {
    targetDistanceRef.current = defaultDistance;
    targetTiltXRef.current = tiltAngle;
  }, [tiltAngle]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene & Environment
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#070709');
    scene.fog = new THREE.FogExp2('#070709', 0.045);

    // 2. Camera: elevated looking slightly down and toward center
    const camera = new THREE.PerspectiveCamera(perspective, width / height, 0.1, 100);
    const elevationRatio = 3.4 / defaultDistance;
    camera.position.set(0, defaultDistance * elevationRatio, defaultDistance);
    camera.lookAt(0, 0.2, 0);

    // 3. Renderer with ACES ToneMapping & Antialiasing
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 4. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0x18201a, 1.4);
    scene.add(ambientLight);

    // Key front light to illuminate foreground cards
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.6);
    keyLight.position.set(0, 6, 8);
    scene.add(keyLight);

    // Rear rim light to provide depth contours for cards rotating to the back
    const rimLight = new THREE.DirectionalLight(0x738c7b, 1.2);
    rimLight.position.set(0, 4, -7);
    scene.add(rimLight);

    // Center point light for metallic sheen on rotating borders
    const centerPointLight = new THREE.PointLight(0xa3c9ab, 1.8, 14);
    centerPointLight.position.set(0, 1.8, 2.5);
    scene.add(centerPointLight);

    // 5. Card Ring Group
    const ringGroup = new THREE.Group();
    ringGroup.rotation.x = tiltAngle;
    scene.add(ringGroup);

    // Card Shapes & Geometries
    const cardShape = createRoundedRectShape(cardWidth, cardHeight, 0.14);
    const extrudeSettings = {
      depth: 0.04,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 1,
      bevelSize: 0.015,
      bevelThickness: 0.015
    };
    const cardGeometry = new THREE.ExtrudeGeometry(cardShape, extrudeSettings);
    cardGeometry.center();

    // Dark olive-gray graphite frame material
    const frameMaterial = new THREE.MeshStandardMaterial({
      color: 0x141815,
      roughness: 0.32,
      metalness: 0.8,
    });

    const cardMeshes = [];
    const cardTextures = [];
    const N = cards.length;

    cards.forEach((item, i) => {
      const cardSubGroup = new THREE.Group();
      const angle = (i / N) * Math.PI * 2;

      // Position in circle
      const x = Math.sin(angle) * ringRadius;
      const z = Math.cos(angle) * ringRadius;
      cardSubGroup.position.set(x, 0, z);
      // Tangential facing: face outward along the ring
      cardSubGroup.rotation.y = angle;

      // Frame Mesh (Back and Sides)
      const frameMesh = new THREE.Mesh(cardGeometry, frameMaterial);
      cardSubGroup.add(frameMesh);

      // Front Face Texture Plane
      const texture = createCardTexture(item, () => {
        renderer.render(scene, camera);
      });
      cardTextures.push(texture);

      const frontFaceGeometry = new THREE.PlaneGeometry(cardWidth - 0.03, cardHeight - 0.03);
      const frontMaterial = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.22,
        metalness: 0.15,
      });

      const frontMesh = new THREE.Mesh(frontFaceGeometry, frontMaterial);
      frontMesh.position.z = 0.038;
      frontMesh.userData = { cardIndex: i, item };
      cardSubGroup.add(frontMesh);

      ringGroup.add(cardSubGroup);
      cardMeshes.push({ group: cardSubGroup, frontMesh, angle, item });
    });

    // 6. Raycasting for Hover Detection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-100, -100);

    const onPointerMove = (e) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (isDraggingRef.current && interactive) {
        const deltaX = e.clientX - pointerStartRef.current.x;
        const deltaY = e.clientY - pointerStartRef.current.y;

        // Horizontal drag -> Rotate Ring around Y axis
        targetRotationYRef.current += deltaX * 0.005;

        // Vertical drag -> Adjust Ring Tilt / Camera Elevation
        targetTiltXRef.current = Math.max(
          -0.55,
          Math.min(0.08, targetTiltXRef.current - deltaY * 0.003)
        );

        pointerStartRef.current = { x: e.clientX, y: e.clientY };
      }
    };

    const onPointerDown = (e) => {
      if (!interactive) return;
      // Only drag if left mouse button or touch
      if (e.button !== undefined && e.button !== 0) return;
      isDraggingRef.current = true;
      pointerStartRef.current = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = () => {
      isDraggingRef.current = false;
    };

    const onMouseEnter = () => {
      if (pauseOnHover) isHoveredRef.current = true;
    };

    const onMouseLeave = () => {
      isHoveredRef.current = false;
      mouse.x = -100;
      mouse.y = -100;
      setActiveCardInfo(null);
    };

    // Scroll Wheel -> Zoom In / Out
    const onWheel = (e) => {
      e.preventDefault();
      const zoomDelta = e.deltaY * 0.006;
      targetDistanceRef.current = Math.max(
        minDistance,
        Math.min(maxDistance, targetDistanceRef.current + zoomDelta)
      );
    };

    // Touch Pinch to Zoom Support
    let initialPinchDist = null;
    const onTouchStart = (e) => {
      if (e.touches.length === 2) {
        initialPinchDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    };

    const onTouchMove = (e) => {
      if (e.touches.length === 2 && initialPinchDist !== null) {
        const currentDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const diff = initialPinchDist - currentDist;
        targetDistanceRef.current = Math.max(
          minDistance,
          Math.min(maxDistance, targetDistanceRef.current + diff * 0.015)
        );
        initialPinchDist = currentDist;
      }
    };

    const onTouchEnd = () => {
      initialPinchDist = null;
    };

    container.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    container.addEventListener('mouseenter', onMouseEnter);
    container.addEventListener('mouseleave', onMouseLeave);
    container.addEventListener('wheel', onWheel, { passive: false });
    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchmove', onTouchMove, { passive: true });
    container.addEventListener('touchend', onTouchEnd);

    // 7. Responsive Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;

      // Adjust camera distance base for mobile
      if (w < 768) {
        targetDistanceRef.current = Math.max(targetDistanceRef.current, 9.6);
      }
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // 8. Animation Loop
    let animationFrameId;
    let hoveredCard = null;
    let lastZoomNotification = 100;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Auto-rotation when not paused by hover or user drag
      if (isPlayingRef.current && (!isHoveredRef.current || isDraggingRef.current)) {
        targetRotationYRef.current += rotationSpeed * speedRef.current;
      }

      // Smooth inertia damping for Y rotation
      currentRotationYRef.current += (targetRotationYRef.current - currentRotationYRef.current) * 0.08;
      ringGroup.rotation.y = currentRotationYRef.current;

      // Smooth inertia damping for Tilt X
      currentTiltXRef.current += (targetTiltXRef.current - currentTiltXRef.current) * 0.08;
      ringGroup.rotation.x = currentTiltXRef.current;

      // Smooth camera distance (Zoom)
      currentDistanceRef.current += (targetDistanceRef.current - currentDistanceRef.current) * 0.08;
      const dist = currentDistanceRef.current;
      camera.position.set(0, dist * elevationRatio, dist);
      camera.lookAt(0, 0.2, 0);

      // Update HUD zoom indicator periodically if changed
      const currentZoomPct = Math.round((defaultDistance / dist) * 100);
      if (Math.abs(currentZoomPct - lastZoomNotification) >= 2) {
        lastZoomNotification = currentZoomPct;
        setZoomPercent(currentZoomPct);
      }

      // Raycasting for interactive hover effects
      raycaster.setFromCamera(mouse, camera);
      const interactiveMeshes = cardMeshes.map((c) => c.frontMesh);
      const intersects = raycaster.intersectObjects(interactiveMeshes);

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        if (hoveredCard !== hit) {
          hoveredCard = hit;
          setActiveCardInfo(hit.userData.item);
        }
      } else {
        if (hoveredCard) {
          hoveredCard = null;
          setActiveCardInfo(null);
        }
      }

      // Dynamic Card Scale / Elevation on Hover
      cardMeshes.forEach(({ group, frontMesh }) => {
        const isHit = frontMesh === hoveredCard;
        const targetScale = isHit ? 1.08 : 1.0;
        group.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
      });

      renderer.render(scene, camera);
    };

    animate();

    // 9. Cleanup on Unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      container.removeEventListener('mouseenter', onMouseEnter);
      container.removeEventListener('mouseleave', onMouseLeave);
      container.removeEventListener('wheel', onWheel);
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('resize', handleResize);

      cardGeometry.dispose();
      frameMaterial.dispose();
      cardTextures.forEach((tex) => tex.dispose());
      renderer.dispose();

      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [cards, cardWidth, cardHeight, ringRadius, rotationSpeed, tiltAngle, perspective, pauseOnHover, interactive, defaultDistance]);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const cycleSpeed = useCallback(() => {
    setSpeedMultiplier((prev) => (prev === 1 ? 2 : prev === 2 ? 0.5 : 1));
  }, []);

  return (
    <div className="threed-card-ring-container" ref={mountRef}>
      {/* Floating Header Overlay */}
      <div className="threed-header-overlay">
        <div className="threed-header-tag">Interactive Three.js Carousel</div>
        <h1 className="threed-header-title">Continuous 3D Card Ring</h1>
      </div>

      {/* Floating HUD Controls */}
      <div className="threed-hud">
        <button
          className={`threed-hud-btn ${isPlaying ? 'active' : ''}`}
          onClick={togglePlay}
          title={isPlaying ? 'Pause Auto-Rotation' : 'Resume Auto-Rotation'}
        >
          {isPlaying ? '⏸ Pause' : '▶ Play'}
        </button>

        <button
          className="threed-hud-btn"
          onClick={cycleSpeed}
          title="Toggle Rotation Speed"
        >
          ⚡ {speedMultiplier}x
        </button>

        <div className="threed-hud-separator"></div>

        {/* Rotate Controls */}
        <button
          className="threed-hud-btn"
          onClick={handleRotateLeft}
          title="Rotate Left"
        >
          ⟲ Spin Left
        </button>

        <button
          className="threed-hud-btn"
          onClick={handleRotateRight}
          title="Rotate Right"
        >
          ⟳ Spin Right
        </button>

        <div className="threed-hud-separator"></div>

        {/* Zoom Controls */}
        <button
          className="threed-hud-btn"
          onClick={handleZoomIn}
          title="Zoom In (or Scroll Up)"
        >
          ＋ Zoom In
        </button>

        <button
          className="threed-hud-btn"
          onClick={handleZoomOut}
          title="Zoom Out (or Scroll Down)"
        >
          － Zoom Out
        </button>

        <button
          className="threed-hud-btn"
          onClick={handleResetView}
          title="Reset Zoom & Tilt Angle"
        >
          ↺ Reset ({zoomPercent}%)
        </button>

        <div className="threed-hud-separator"></div>

        <div className="threed-hud-hint">
          {activeCardInfo ? `Active: ${activeCardInfo.title}` : 'Scroll/Pinch to Zoom • Drag to Rotate & Tilt'}
        </div>
      </div>
    </div>
  );
};

export default ThreeDCardRing;
