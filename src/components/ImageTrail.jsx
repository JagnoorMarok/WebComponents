import React, { useEffect, useRef, useState, useCallback } from 'react';
import { trailImagesData, DEFAULT_TRAIL_CONFIG } from '../data/imageTrailData';
import './ImageTrail.css';

/**
 * Back-easing curve for crisp card pop-in.
 */
function easeOutBack(t) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

const POOL_SIZE = 32;

const ImageTrail = ({
  images = trailImagesData,
  spawnDistance: initialSpawnDist = DEFAULT_TRAIL_CONFIG.spawnDistance,
  maxImages: initialMaxImages = DEFAULT_TRAIL_CONFIG.maxImages,
  imageLifetime: initialLifetime = DEFAULT_TRAIL_CONFIG.imageLifetime,
  fadeDuration = DEFAULT_TRAIL_CONFIG.fadeDuration,
  rotationRange = DEFAULT_TRAIL_CONFIG.rotationRange,
  minScale = DEFAULT_TRAIL_CONFIG.minScale,
  maxScale = DEFAULT_TRAIL_CONFIG.maxScale,
}) => {
  const containerRef = useRef(null);
  const cardPoolRefs = useRef([]);
  const activeCardsRef = useRef([]);
  const poolIndexRef = useRef(0);
  const zIndexCounterRef = useRef(100);
  const nextImageIdxRef = useRef(0);
  const lastSpawnPosRef = useRef({ x: -9999, y: -9999 });
  const animFrameIdRef = useRef(null);
  const isRunningRef = useRef(false);

  // HUD and interactive configuration state
  const [spawnDistance, setSpawnDistance] = useState(initialSpawnDist);
  const [maxImages, setMaxImages] = useState(initialMaxImages);
  const [imageLifetime, setImageLifetime] = useState(initialLifetime);
  const [cardStyle, setCardStyle] = useState('all');
  const [scaleMultiplier, setScaleMultiplier] = useState(1.0);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Mutable refs for RAF loop performance without React re-renders
  const configRef = useRef({
    spawnDistance,
    maxImages,
    imageLifetime,
    fadeDuration,
    rotationRange,
    minScale,
    maxScale,
    scaleMultiplier,
    cardStyle,
  });

  useEffect(() => {
    configRef.current = {
      spawnDistance,
      maxImages,
      imageLifetime,
      fadeDuration,
      rotationRange,
      minScale,
      maxScale,
      scaleMultiplier,
      cardStyle,
    };
  }, [
    spawnDistance,
    maxImages,
    imageLifetime,
    fadeDuration,
    rotationRange,
    minScale,
    maxScale,
    scaleMultiplier,
    cardStyle,
  ]);

  // Cursor indicator tracker
  const cursorFollowerRef = useRef(null);

  /**
   * Main 60 FPS animation loop.
   * Updates only active card DOM nodes using GPU-accelerated transforms.
   */
  const startAnimationLoop = useCallback(() => {
    if (isRunningRef.current) return;
    isRunningRef.current = true;

    const tick = (now) => {
      const active = activeCardsRef.current;
      const cfg = configRef.current;

      let hasActiveCards = false;

      for (let i = 0; i < active.length; i++) {
        const card = active[i];
        if (!card.active) continue;

        const age = now - card.spawnTime;
        const totalLifetime = cfg.imageLifetime;
        const fadeStart = Math.max(120, totalLifetime - cfg.fadeDuration);

        if (age >= totalLifetime) {
          // Retire card
          card.active = false;
          if (card.domElement) {
            card.domElement.style.display = 'none';
          }
          continue;
        }

        hasActiveCards = true;

        let scale = card.targetScale;
        let opacity = 1.0;

        // 1. Entry Phase (0 - 130ms): pop-in from scale 0.72 to 1.0
        const enterDur = 130;
        if (age < enterDur) {
          const t = Math.max(0, Math.min(1, age / enterDur));
          const backVal = easeOutBack(t);
          scale = card.targetScale * (0.72 + 0.28 * backVal);
          opacity = Math.min(1.0, t * 1.35);
        }
        // 2. Sustained Phase (130ms - fadeStart): fully visible
        else if (age < fadeStart) {
          scale = card.targetScale;
          opacity = 1.0;
        }
        // 3. Exit Phase (fadeStart - totalLifetime): smooth fade & slight shrink
        else {
          const fadeProgress = (age - fadeStart) / (totalLifetime - fadeStart);
          opacity = Math.max(0, 1.0 - fadeProgress);
          scale = card.targetScale * (1.0 - 0.12 * fadeProgress);
        }

        // Apply subtle velocity drift
        const seconds = age / 1000;
        const curX = card.x + card.vx * seconds * 35;
        const curY = card.y + card.vy * seconds * 35;

        if (card.domElement) {
          // Transform centered at cursor position
          card.domElement.style.transform = `translate3d(${curX - card.width / 2}px, ${curY - card.height / 2}px, 0) rotate(${card.rotation}deg) scale(${scale})`;
          card.domElement.style.opacity = opacity;
        }
      }

      if (hasActiveCards) {
        animFrameIdRef.current = requestAnimationFrame(tick);
      } else {
        isRunningRef.current = false;
      }
    };

    animFrameIdRef.current = requestAnimationFrame(tick);
  }, []);

  /**
   * Spawns a new image card at (x, y) along the cursor path.
   */
  const spawnImageAt = useCallback(
    (x, y, dx = 0, dy = 0) => {
      const cfg = configRef.current;
      const pool = cardPoolRefs.current;
      if (!pool || pool.length === 0) return;

      // Filter images if specific style is selected
      let availableImages = images;
      if (cfg.cardStyle !== 'all') {
        const filtered = images.filter((img) => img.theme === cfg.cardStyle);
        if (filtered.length > 0) availableImages = filtered;
      }

      // Pick next image in cycle
      const imgData = availableImages[nextImageIdxRef.current % availableImages.length];
      nextImageIdxRef.current++;

      // Controlled organic jitter
      const jitterX = (Math.random() - 0.5) * 14;
      const jitterY = (Math.random() - 0.5) * 14;

      // Angular rotation with subtle movement direction bias
      const dirAngle = Math.atan2(dy, dx) * (180 / Math.PI);
      const angleBias = isNaN(dirAngle) ? 0 : dirAngle * 0.035;
      const randomRot = (Math.random() - 0.5) * cfg.rotationRange;
      const finalRot = Math.max(-16, Math.min(16, randomRot + angleBias));

      // Scale variation
      const baseScale =
        (cfg.minScale + Math.random() * (cfg.maxScale - cfg.minScale)) * cfg.scaleMultiplier;

      // Subtle directional inertia drift
      const speed = Math.sqrt(dx * dx + dy * dy);
      const maxDrift = 1.4;
      const vx = speed > 0 ? (dx / speed) * Math.min(maxDrift, speed * 0.05) : 0;
      const vy = speed > 0 ? (dy / speed) * Math.min(maxDrift, speed * 0.05) : 0;

      // Select next slot in recycled element pool
      const slotIndex = poolIndexRef.current % POOL_SIZE;
      poolIndexRef.current++;

      const domEl = pool[slotIndex];
      if (!domEl) return;

      // Layer above previous cards
      const zIndex = zIndexCounterRef.current++;
      if (zIndexCounterRef.current > 9000) zIndexCounterRef.current = 100;

      // Determine dimensions
      const cardW = imgData.width || 170;
      const cardH = imgData.height || 190;

      // Update DOM element content & styling
      domEl.style.width = `${cardW}px`;
      domEl.style.height = `${cardH}px`;
      domEl.style.zIndex = zIndex;
      domEl.style.display = 'block';
      domEl.style.opacity = '0';
      domEl.style.transform = `translate3d(${x + jitterX - cardW / 2}px, ${y + jitterY - cardH / 2}px, 0) rotate(${finalRot}deg) scale(0.7)`;

      // Set image and styling classes
      const imgTag = domEl.querySelector('.trail-card-image');
      if (imgTag && imgTag.src !== imgData.image) {
        imgTag.src = imgData.image;
      }
      const titleTag = domEl.querySelector('.trail-card-title');
      if (titleTag) titleTag.textContent = imgData.title;
      const catTag = domEl.querySelector('.trail-card-category');
      if (catTag) catTag.textContent = imgData.category;
      const numTag = domEl.querySelector('.trail-card-num');
      if (numTag) numTag.textContent = imgData.number || '';

      // Update card style class
      domEl.className = `trail-card-item theme-${imgData.theme || 'editorial'}`;

      // Register into active cards list
      const cardObj = {
        slotIndex,
        domElement: domEl,
        x: x + jitterX,
        y: y + jitterY,
        vx,
        vy,
        width: cardW,
        height: cardH,
        rotation: finalRot,
        targetScale: baseScale,
        spawnTime: performance.now(),
        active: true,
      };

      activeCardsRef.current[slotIndex] = cardObj;

      // Enforce max active images limit
      const activeItems = activeCardsRef.current.filter((c) => c && c.active);
      if (activeItems.length > cfg.maxImages) {
        // Find oldest active card and force immediate fade/retire
        activeItems.sort((a, b) => a.spawnTime - b.spawnTime);
        const overLimit = activeItems.length - cfg.maxImages;
        for (let k = 0; k < overLimit; k++) {
          activeItems[k].spawnTime = performance.now() - (cfg.imageLifetime - 80);
        }
      }

      startAnimationLoop();
    },
    [images, startAnimationLoop]
  );

  /**
   * Pointer movement handler.
   */
  const handlePointerMove = useCallback(
    (e) => {
      const container = containerRef.current;
      if (!container) return;

      if (!hasInteracted) setHasInteracted(true);

      const rect = container.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;

      // Update interactive glowing cursor tracker
      if (cursorFollowerRef.current) {
        cursorFollowerRef.current.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
        cursorFollowerRef.current.style.opacity = '1';
      }

      // Check distance from previous spawn point
      const last = lastSpawnPosRef.current;
      const dx = currentX - last.x;
      const dy = currentY - last.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      const threshold = configRef.current.spawnDistance;

      if (distance >= threshold) {
        spawnImageAt(currentX, currentY, dx, dy);
        lastSpawnPosRef.current = { x: currentX, y: currentY };
      }
    },
    [hasInteracted, spawnImageAt]
  );

  const handlePointerLeave = useCallback(() => {
    if (cursorFollowerRef.current) {
      cursorFollowerRef.current.style.opacity = '0';
    }
    // Reset spawn coordinate so next entry doesn't compute huge distance from previous edge
    lastSpawnPosRef.current = { x: -9999, y: -9999 };
  }, []);

  /**
   * Clears all currently visible cards instantly.
   */
  const clearTrail = useCallback(() => {
    const active = activeCardsRef.current;
    for (let i = 0; i < active.length; i++) {
      if (active[i]) {
        active[i].active = false;
        if (active[i].domElement) {
          active[i].domElement.style.display = 'none';
        }
      }
    }
  }, []);

  /**
   * Automated trail burst demo along an organic curved path.
   */
  const runBurstDemo = useCallback(() => {
    setHasInteracted(true);
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    const centerX = w / 2;
    const centerY = h / 2;
    const radiusX = Math.min(w * 0.36, 440);
    const radiusY = Math.min(h * 0.28, 260);

    let step = 0;
    const totalSteps = 16;
    const intervalTime = 65;

    let prevX = centerX;
    let prevY = centerY;

    const interval = setInterval(() => {
      const angle = (step / totalSteps) * Math.PI * 2.3;
      // Elegant infinity / Lissajous curve
      const x = centerX + Math.sin(angle) * radiusX;
      const y = centerY + Math.sin(angle * 2) * (radiusY * 0.7);

      const dx = x - prevX;
      const dy = y - prevY;

      spawnImageAt(x, y, dx, dy);
      prevX = x;
      prevY = y;

      if (cursorFollowerRef.current) {
        cursorFollowerRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        cursorFollowerRef.current.style.opacity = '1';
      }

      step++;
      if (step >= totalSteps) {
        clearInterval(interval);
        setTimeout(() => {
          if (cursorFollowerRef.current) cursorFollowerRef.current.style.opacity = '0';
        }, 1200);
      }
    }, intervalTime);
  }, [spawnImageAt]);

  // Clean up RAF loop on unmount
  useEffect(() => {
    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, []);

  return (
    <div
      className="image-trail-container"
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {/* Ambient Radial Lighting */}
      <div className="trail-vignette" />
      <div className="trail-ambient-glow" />

      {/* Floating Center Prompt (fades once user starts moving) */}
      <div className={`trail-center-hint ${hasInteracted ? 'hidden' : ''}`}>
        <div className="trail-hint-badge">Interactive Cursor Animation</div>
        <h2 className="trail-hint-title">Move your cursor to paint a trail</h2>
        <p className="trail-hint-subtitle">
          Photographic cards continuously spawn along your movement trajectory.
        </p>
      </div>

      {/* Subtle Glowing Cursor Tracker */}
      <div className="trail-cursor-follower" ref={cursorFollowerRef} />

      {/* Pre-Allocated DOM Card Pool (32 slots) */}
      <div className="trail-cards-layer">
        {Array.from({ length: POOL_SIZE }).map((_, idx) => (
          <div
            key={`trail-slot-${idx}`}
            ref={(el) => {
              cardPoolRefs.current[idx] = el;
            }}
            className="trail-card-item"
            style={{ display: 'none' }}
          >
            <div className="trail-card-inner">
              <div className="trail-card-image-wrap">
                <img
                  className="trail-card-image"
                  src={images[idx % images.length].image}
                  alt=""
                  loading="eager"
                  draggable={false}
                />
                <div className="trail-card-sheen" />
              </div>
              <div className="trail-card-footer">
                <span className="trail-card-num">01</span>
                <div className="trail-card-meta">
                  <div className="trail-card-title">EDITORIAL</div>
                  <div className="trail-card-category">PHOTOGRAPHY</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Glassmorphic Ambient Floating HUD */}
      <div className="trail-hud" onClick={(e) => e.stopPropagation()}>
        {/* Burst Demo Button */}
        <button
          className="trail-hud-btn burst-btn"
          onClick={runBurstDemo}
          title="Play automated trail animation"
        >
          ✨ Burst Trail
        </button>

        <div className="trail-hud-divider" />

        {/* Distance Slider */}
        <div className="trail-slider-group">
          <span className="trail-hud-label">Spacing:</span>
          <input
            type="range"
            min="45"
            max="135"
            step="5"
            value={spawnDistance}
            onChange={(e) => setSpawnDistance(Number(e.target.value))}
            className="trail-slider"
            title={`Spawn Distance: ${spawnDistance}px`}
          />
          <span className="trail-slider-badge">{spawnDistance}px</span>
        </div>

        <div className="trail-hud-divider" />

        {/* Lifetime Slider */}
        <div className="trail-slider-group">
          <span className="trail-hud-label">Lifetime:</span>
          <input
            type="range"
            min="550"
            max="1800"
            step="50"
            value={imageLifetime}
            onChange={(e) => setImageLifetime(Number(e.target.value))}
            className="trail-slider"
            title={`Card Lifetime: ${imageLifetime}ms`}
          />
          <span className="trail-slider-badge">{(imageLifetime / 1000).toFixed(1)}s</span>
        </div>

        <div className="trail-hud-divider" />

        {/* Max Active Images Slider */}
        <div className="trail-slider-group">
          <span className="trail-hud-label">Density:</span>
          <input
            type="range"
            min="10"
            max="28"
            step="2"
            value={maxImages}
            onChange={(e) => setMaxImages(Number(e.target.value))}
            className="trail-slider"
            title={`Max Active Cards: ${maxImages}`}
          />
          <span className="trail-slider-badge">{maxImages}</span>
        </div>

        <div className="trail-hud-divider" />

        {/* Card Style Selector */}
        <div className="trail-style-group">
          {['all', 'editorial', 'polaroid', 'minimal'].map((st) => (
            <button
              key={st}
              className={`trail-style-pill ${cardStyle === st ? 'selected' : ''}`}
              onClick={() => setCardStyle(st)}
            >
              {st.charAt(0).toUpperCase() + st.slice(1)}
            </button>
          ))}
        </div>

        <div className="trail-hud-divider" />

        {/* Scale Multiplier */}
        <button
          className="trail-hud-btn"
          onClick={() => {
            setScaleMultiplier((prev) => (prev === 1.0 ? 1.25 : prev === 1.25 ? 0.8 : 1.0));
          }}
          title="Cycle Card Dimensions"
        >
          Size: {scaleMultiplier === 1.0 ? 'Med' : scaleMultiplier === 1.25 ? 'Lg' : 'Sm'}
        </button>

        {/* Clear Button */}
        <button
          className="trail-hud-btn"
          onClick={clearTrail}
          title="Clear all active cards"
        >
          ✕ Clear
        </button>
      </div>
    </div>
  );
};

export default ImageTrail;
