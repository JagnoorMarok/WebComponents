import React, { useState, useEffect, useRef, useCallback } from 'react';
import { tossCardsData, createTossPhysics } from '../data/cardTossData';
import './CardToss.css';

/**
 * CardToss Component
 * Simulates a continuous physical stream of photographic & editorial cards
 * tossed upward from below the screen in realistic parabolic trajectories.
 */
const CardToss = ({
  cards = tossCardsData,
  defaultGravity = 1080,
  defaultForce = 1.0,
}) => {
  const containerRef = useRef(null);
  const cardElementsRef = useRef({});

  // Physics simulation state (kept outside React state to avoid re-renders at 60fps)
  const physicsRef = useRef([]);
  const animFrameIdRef = useRef(null);
  const lastTimeRef = useRef(0);

  // HUD & UI States
  const [isPlaying, setIsPlaying] = useState(true);
  const [gravityMode, setGravityMode] = useState('earth'); // 'moon', 'earth', 'snappy'
  const [targetInFlight, setTargetInFlight] = useState(7); // Slider for average cards in flight
  const [activeCount, setActiveCount] = useState(0);
  const [tossCount, setTossCount] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Ref mirrors for 60fps RAF loop
  const isPlayingRef = useRef(isPlaying);
  const gravityRef = useRef(defaultGravity);
  const forceRef = useRef(defaultForce);
  const targetInFlightRef = useRef(targetInFlight);

  // Synchronize target in flight and wake up newly enabled cards
  useEffect(() => {
    const prev = targetInFlightRef.current;
    targetInFlightRef.current = targetInFlight;

    if (targetInFlight > prev && physicsRef.current.length > 0) {
      let stagger = 0;
      for (let i = prev; i < targetInFlight; i++) {
        if (physicsRef.current[i] && !physicsRef.current[i].isActive) {
          physicsRef.current[i].delayTimer = stagger * 0.16 + 0.05;
          stagger++;
        }
      }
    }
  }, [targetInFlight]);

  // Synchronize gravity ref when mode changes
  useEffect(() => {
    if (gravityMode === 'moon') gravityRef.current = 680;
    else if (gravityMode === 'earth') gravityRef.current = 1080;
    else if (gravityMode === 'snappy') gravityRef.current = 1450;
  }, [gravityMode]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Initialize physics profiles for all cards with staggered spawn delays
  const initPhysics = useCallback(() => {
    const W = containerRef.current ? containerRef.current.clientWidth : window.innerWidth;
    const H = containerRef.current ? containerRef.current.clientHeight : window.innerHeight;

    physicsRef.current = cards.map((card, idx) => {
      const p = createTossPhysics(W, H, card, {
        gravity: gravityRef.current,
        forceMultiplier: forceRef.current,
      });

      const isInitiallyActive = idx < targetInFlightRef.current;
      return {
        ...p,
        cardId: card.id,
        // Active cards start with staggered delays; excess cards parked
        delayTimer: isInitiallyActive ? idx * 0.38 + Math.random() * 0.12 : 999999,
        isActive: false,
      };
    });
  }, [cards]);

  // Launches an individual card immediately
  const launchCard = useCallback((cardIndex, customX = null) => {
    if (!containerRef.current) return;
    const W = containerRef.current.clientWidth;
    const H = containerRef.current.clientHeight;
    const card = cards[cardIndex % cards.length];

    const freshPhysics = createTossPhysics(W, H, card, {
      gravity: gravityRef.current,
      forceMultiplier: forceRef.current,
    });

    if (customX !== null) {
      freshPhysics.x = Math.max(10, Math.min(W - card.width - 10, customX - card.width / 2));
    }

    physicsRef.current[cardIndex] = {
      ...freshPhysics,
      cardId: card.id,
      delayTimer: 0,
      isActive: true,
    };

    setTossCount((prev) => prev + 1);
  }, [cards]);

  // "Toss Handful" Burst button: launches 4-6 cards in a flurry
  const tossHandful = useCallback(() => {
    const inactiveIndices = [];
    physicsRef.current.forEach((p, idx) => {
      if (!p.isActive || p.delayTimer > 0.5) {
        inactiveIndices.push(idx);
      }
    });

    const candidates = inactiveIndices.length >= 4 ? inactiveIndices : [0, 2, 4, 6, 8];
    candidates.slice(0, 5).forEach((idx, order) => {
      if (physicsRef.current[idx]) {
        physicsRef.current[idx].delayTimer = order * 0.12;
      }
    });
  }, []);

  // Main 60 FPS Physics Simulation Loop
  useEffect(() => {
    initPhysics();

    const updatePhysics = (now) => {
      const delta = lastTimeRef.current ? Math.min((now - lastTimeRef.current) / 1000, 0.033) : 0.016;
      lastTimeRef.current = now;

      if (containerRef.current && isPlayingRef.current) {
        const W = containerRef.current.clientWidth;
        const H = containerRef.current.clientHeight;
        let inFlight = 0;

        physicsRef.current.forEach((p, idx) => {
          const el = cardElementsRef.current[p.cardId];
          if (!el) return;

          // 1. If this card index is beyond current slider limit and not already airborne, keep parked
          if (idx >= targetInFlightRef.current && !p.isActive) {
            p.delayTimer = 999999;
            el.style.transform = `translate3d(${p.x}px, ${H + 300}px, 0px)`;
            return;
          }

          // 2. Handle pre-launch delay
          if (p.delayTimer > 0) {
            p.delayTimer -= delta;
            if (p.delayTimer <= 0) {
              p.isActive = true;
              p.delayTimer = 0;
            } else {
              // Keep parked below viewport
              el.style.transform = `translate3d(${p.x}px, ${H + 300}px, 0px)`;
              return;
            }
          }

          if (!p.isActive) return;

          // 3. Ballistic trajectory integration (Euler):
          // Acceleration due to gravity
          p.vy += p.gravity * delta;
          p.x += p.vx * delta;
          p.y += p.vy * delta;
          p.rotation += p.angularVelocity * delta;

          // Air resistance on horizontal drift
          p.vx *= (1 - 0.08 * delta);

          // 4. State transitions
          if (p.vy < 0) {
            p.state = 'rising';
          } else {
            p.state = 'falling';
          }

          // Count visible cards
          if (p.y < H + 50 && p.y > -cards[idx % cards.length].height - 50) {
            inFlight++;
          }

          // 5. Subtle depth & 3D tilt effects
          // At the apex (near vy = 0), card reaches max scale
          const verticalSpeedRatio = Math.min(1, Math.abs(p.vy) / 900);
          const apexFloatScale = p.baseScale * (1.04 - verticalSpeedRatio * 0.05);

          // 3D tilt tangent to horizontal and vertical momentum
          const tiltX = Math.max(-14, Math.min(14, (p.vy / 1000) * 12));
          const tiltY = Math.max(-14, Math.min(14, -(p.vx / 300) * 12));

          // 6. Apply GPU accelerated transform directly to DOM
          el.style.transform = `translate3d(${p.x}px, ${p.y}px, ${p.zDepth}px) rotateZ(${p.rotation}deg) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(${apexFloatScale})`;
          el.style.zIndex = p.zIndex;

          // Dynamic shadow that stretches as card rises higher away from floor
          const heightAboveBottom = Math.max(0, H - p.y);
          const shadowBlur = Math.min(45, 15 + heightAboveBottom * 0.04);
          const shadowSpread = Math.min(25, 8 + heightAboveBottom * 0.02);
          const shadowAlpha = Math.max(0.18, 0.45 - heightAboveBottom * 0.0003);
          el.style.boxShadow = `0 ${shadowSpread}px ${shadowBlur}px rgba(0, 0, 0, ${shadowAlpha}), 0 4px 12px rgba(0, 0, 0, 0.25)`;

          // 7. Recycle card once it falls completely below the screen
          if (p.y > H + 180 && p.vy > 0) {
            p.isActive = false;

            // If this card is beyond targetInFlight, park it
            if (idx >= targetInFlightRef.current) {
              p.delayTimer = 999999;
              el.style.transform = `translate3d(${p.x}px, ${H + 300}px, 0px)`;
              return;
            }

            // Recycle delay dynamically scales with density
            const densityFactor = Math.max(0.18, (18 - targetInFlightRef.current) / 14);
            p.delayTimer = (0.2 + Math.random() * 0.75) * densityFactor;

            // Generate fresh physics parameters for the next toss
            const card = cards[idx % cards.length];
            const nextPhysics = createTossPhysics(W, H, card, {
              gravity: gravityRef.current,
              forceMultiplier: forceRef.current,
            });

            // Assign new values to existing object
            Object.assign(p, nextPhysics);
          }
        });

        setActiveCount(inFlight);
      }

      animFrameIdRef.current = requestAnimationFrame(updatePhysics);
    };

    animFrameIdRef.current = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(animFrameIdRef.current);
  }, [cards, initPhysics]);

  // Window resize handler: re-adjust bounds
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      const W = containerRef.current.clientWidth;
      // Clamp any active card x positions if viewport shrank
      physicsRef.current.forEach((p, idx) => {
        const cardW = cards[idx % cards.length].width;
        if (p.x > W - cardW) {
          p.x = Math.max(20, W - cardW - 20);
        }
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [cards]);

  // Interactive card click: give it an upward physical impulse!
  const handleCardClick = (e, cardIndex) => {
    e.stopPropagation();
    const p = physicsRef.current[cardIndex];
    if (p) {
      p.vy = -Math.abs(p.vy || 800) - 350; // Pop upward
      p.angularVelocity += (Math.random() - 0.5) * 90; // Spin flick
      p.zIndex = 100; // Bring to absolute front
      setTossCount((c) => c + 1);
    }
  };

  // Clicking background launches a card from the click X coordinate
  const handleStageClick = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;

    // Find the first available or lowest card
    let bestIdx = 0;
    let maxY = -9999;
    physicsRef.current.forEach((p, idx) => {
      if (!p.isActive) {
        bestIdx = idx;
        maxY = 99999;
      } else if (p.y > maxY) {
        maxY = p.y;
        bestIdx = idx;
      }
    });

    launchCard(bestIdx, clickX);
  };

  return (
    <div
      ref={containerRef}
      className="card-toss-container"
      onClick={handleStageClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Ambient Visual Background */}
      <div className="card-toss-vignette" />
      <div className="card-toss-ambient-glow" />

      {/* Header Overlay */}
      <div className="card-toss-header">
        <div className="card-toss-badge">Ballistic Physics Engine</div>
        <h1 className="card-toss-title">Card Toss</h1>
        <p className="card-toss-subtitle">
          Continuous organic parabolic projectile motion. Click any card to pop it upward.
        </p>
      </div>

      {/* 3D Ballistic Stage */}
      <div className="card-toss-stage">
        {cards.map((card, idx) => (
          <div
            key={card.id}
            ref={(node) => {
              if (node) cardElementsRef.current[card.id] = node;
            }}
            className={`toss-card toss-card-${card.theme || 'minimal-white'} toss-card-${card.aspect || 'portrait'}`}
            style={{
              width: `${card.width}px`,
              height: `${card.height}px`,
              transform: `translate3d(-999px, 9999px, 0px)`,
            }}
            onClick={(e) => handleCardClick(e, idx)}
          >
            <div className="toss-card-inner">
              <div className="toss-card-img-wrap">
                <img
                  src={card.image}
                  alt={card.title}
                  className="toss-card-image"
                  loading="lazy"
                  draggable={false}
                />
                <div className="toss-card-sheen" />
              </div>

              {card.theme !== 'borderless' && (
                <div className="toss-card-footer">
                  <div className="toss-card-category">{card.category}</div>
                  <div className="toss-card-caption">{card.caption}</div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Controls HUD */}
      <div className="card-toss-hud">
        {/* Play/Pause Button */}
        <button
          className={`card-toss-hud-btn ${isPlaying ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            setIsPlaying((prev) => !prev);
          }}
          title={isPlaying ? 'Pause Motion' : 'Resume Motion'}
        >
          {isPlaying ? '⏸ Pause' : '▶ Play'}
        </button>

        <div className="card-toss-hud-divider" />

        {/* Gravity Preset Switcher */}
        <div className="card-toss-gravity-group">
          <span className="card-toss-hud-label">Gravity:</span>
          <button
            className={`card-toss-pill ${gravityMode === 'moon' ? 'selected' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setGravityMode('moon');
            }}
            title="Low gravity float"
          >
            Moon
          </button>
          <button
            className={`card-toss-pill ${gravityMode === 'earth' ? 'selected' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setGravityMode('earth');
            }}
            title="Realistic earth gravity"
          >
            Earth
          </button>
          <button
            className={`card-toss-pill ${gravityMode === 'snappy' ? 'selected' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setGravityMode('snappy');
            }}
            title="Fast, energetic ballistic curve"
          >
            Snappy
          </button>
        </div>

        <div className="card-toss-hud-divider" />

        {/* In-Flight Cards Density Slider */}
        <div className="card-toss-slider-group" onClick={(e) => e.stopPropagation()}>
          <span className="card-toss-hud-label">Density:</span>
          <input
            type="range"
            min="2"
            max="16"
            step="1"
            value={targetInFlight}
            onChange={(e) => setTargetInFlight(Number(e.target.value))}
            className="card-toss-slider"
            title={`Average in-flight cards: ${targetInFlight}`}
          />
          <span className="card-toss-slider-badge">{targetInFlight}</span>
        </div>

        <div className="card-toss-hud-divider" />

        {/* Toss Burst Action */}
        <button
          className="card-toss-hud-btn burst-btn"
          onClick={(e) => {
            e.stopPropagation();
            tossHandful();
          }}
          title="Toss a rapid handful of 5 cards into the air!"
        >
          ✨ Toss Handful
        </button>

        <div className="card-toss-hud-divider" />

        {/* Physics Telemetry Display */}
        <div className="card-toss-telemetry">
          <span className="telemetry-pill">
            In Flight: <strong>{activeCount}</strong>
          </span>
          <span className="telemetry-pill">
            Total Tosses: <strong>{tossCount}</strong>
          </span>
        </div>
      </div>
    </div>
  );
};

export default CardToss;
