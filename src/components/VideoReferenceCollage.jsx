import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  videoCards,
  calculateRevolvingGrid3DTransform,
  calculateSlotConveyor3DTransform,
  UNIFORM_CARD_WIDTH,
  UNIFORM_CARD_HEIGHT,
} from '../data/videoReferenceData';
import './VideoReferenceCollage.css';

/**
 * Renders the interlocking olive/cream scallop arch pattern
 */
function renderScallopPattern() {
  return (
    <svg viewBox="0 0 160 140" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="scallop-v" x="0" y="0" width="40" height="35" patternUnits="userSpaceOnUse">
          <path d="M 0 35 A 20 20 0 0 1 40 35 Z" fill="#ebe6d8" />
          <path d="M 5 35 A 15 15 0 0 1 35 35 Z" fill="#475440" />
          <path d="M 10 35 A 10 10 0 0 1 30 35 Z" fill="#ebe6d8" />
          <path d="M 15 35 A 5 5 0 0 1 25 35 Z" fill="#475440" />
        </pattern>
        <pattern id="scallop-offset-v" x="20" y="17.5" width="40" height="35" patternUnits="userSpaceOnUse">
          <path d="M 0 35 A 20 20 0 0 1 40 35 Z" fill="#ebe6d8" />
          <path d="M 5 35 A 15 15 0 0 1 35 35 Z" fill="#475440" />
          <path d="M 10 35 A 10 10 0 0 1 30 35 Z" fill="#ebe6d8" />
          <path d="M 15 35 A 5 5 0 0 1 25 35 Z" fill="#475440" />
        </pattern>
      </defs>
      <rect width="160" height="140" fill="#475440" />
      <rect width="160" height="140" fill="url(#scallop-v)" />
      <rect width="160" height="140" fill="url(#scallop-offset-v)" opacity="0.9" />
    </svg>
  );
}

/**
 * Renders individual card content matching reference.mp4
 */
function renderVideoCard(card) {
  switch (card.type) {
    case 'thu-large':
    case 'thu-medium':
      return (
        <>
          <img src={card.image} alt={card.title} className="thu-bg" />
          <div className="thu-content">
            <h2>{card.title}</h2>
            <div className="thu-sub">{card.subtitle}</div>
          </div>
        </>
      );

    case 'nov-olive':
      return (
        <div className="nov-inner">
          <img src={card.image} alt="November" className="nov-photo" />
          <div className="nov-text-overlay">
            <h3>{card.year}</h3>
            <div className="nov-month">{card.month}</div>
          </div>
        </div>
      );

    case 'natural-fresh':
      return (
        <h2>
          <span>{card.title}</span>
          <span>{card.subtitle}</span>
        </h2>
      );

    case 'stat-12k':
      return (
        <>
          <img src={card.image} alt="12k" className="stat-bg" />
          <div className="stat-content">
            <h2>{card.number}</h2>
            <div className="stat-label">
              <span>{card.label1}</span>
              <em>{card.label2}</em>
            </div>
          </div>
        </>
      );

    case 'maple-street':
      return (
        <>
          <div className="maple-photo-oval">
            <img
              src="https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=600&q=80"
              alt="Flower"
            />
          </div>
          <p className="maple-text">
            {card.line1}<br />
            {card.line2}<br />
            {card.line3}
          </p>
          <div className="maple-bar"></div>
        </>
      );

    case 'arch-pattern':
      return renderScallopPattern();

    case 'ultimate-taste':
      return (
        <div className="ultimate-inner">
          <h2>{card.title}</h2>
          <h3>{card.subtitle}</h3>
          <div className="ultimate-arch-preview">
            <svg viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="25" cy="45" r="20" fill="#475440" />
              <circle cx="55" cy="45" r="20" fill="#475440" />
              <circle cx="85" cy="45" r="20" fill="#475440" />
              <circle cx="40" cy="25" r="20" fill="#ebe6d8" />
              <circle cx="70" cy="25" r="20" fill="#ebe6d8" />
            </svg>
          </div>
        </div>
      );

    case 'cities-madrid':
      return (
        <div className="cities-inner">
          <div className="cities-row">
            <span>{card.cities[0]}</span>
            <span className="cities-num">{card.num1}</span>
          </div>
          <div className="cities-row">
            <span>{card.cities[1]}</span>
          </div>
          <div className="cities-row">
            <span>{card.cities[2]}</span>
            <span className="cities-num">{card.num2}</span>
          </div>
        </div>
      );

    case 'num-column':
      return (
        <div className="num-col-inner">
          <span className="top-num">{card.numTop}</span>
          <div className="col-divider"></div>
          <span className="bot-num">{card.numBottom}</span>
        </div>
      );

    case 'north-ave':
      return (
        <>
          <div className="north-photo-frame">
            <img src={card.image} alt="North Ave" />
          </div>
          <div className="north-label">{card.title}</div>
        </>
      );

    case 'checker-portrait':
      return (
        <>
          <img src={card.image} alt="Portrait" className="portrait-bg" />
          <div className="checker-mask">
            {Array.from({ length: 16 }).map((_, idx) => {
              const row = Math.floor(idx / 4);
              const col = idx % 4;
              const isWhite = (row + col) % 2 === 0;
              return (
                <div
                  key={idx}
                  className={isWhite ? 'checker-cell-w' : 'checker-cell-b'}
                />
              );
            })}
          </div>
        </>
      );

    case 'small-portrait':
    case 'flower-stem':
      return <img src={card.image} alt="Detail" />;

    default:
      return null;
  }
}

const VideoReferenceCollage = ({
  cards = videoCards,
  autoPlay = true,
  cyclePeriod = 12000,
}) => {
  const [revolveMode, setRevolveMode] = useState('orbit'); // 'orbit' or 'conveyor'
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [isHovered, setIsHovered] = useState(false);
  const [currentLeadTitle, setCurrentLeadTitle] = useState('THU 0316 AVE');

  const progressRef = useRef(0);
  const cardElementsRef = useRef({});
  const lastTimeRef = useRef(0);
  const isPlayingRef = useRef(isPlaying);
  const speedRef = useRef(speedMultiplier);
  const isHoveredRef = useRef(isHovered);
  const revolveModeRef = useRef(revolveMode);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
    speedRef.current = speedMultiplier;
    isHoveredRef.current = isHovered;
    revolveModeRef.current = revolveMode;
  }, [isPlaying, speedMultiplier, isHovered, revolveMode]);

  // Silky smooth 60fps RAF loop
  useEffect(() => {
    let animId;

    const updateFrame = (now) => {
      const delta = lastTimeRef.current ? (now - lastTimeRef.current) / 1000 : 0.016;
      lastTimeRef.current = now;

      if (isPlayingRef.current && !isHoveredRef.current) {
        const progressDelta = (delta * speedRef.current) / (cyclePeriod / 1000);
        progressRef.current = (progressRef.current + progressDelta) % 1.0;

        let highestZ = -9999;
        let frontCardName = '';

        cards.forEach((card, idx) => {
          const el = cardElementsRef.current[card.id];
          if (!el) return;

          const t = revolveModeRef.current === 'orbit'
            ? calculateRevolvingGrid3DTransform(progressRef.current, idx)
            : calculateSlotConveyor3DTransform(progressRef.current, idx);

          if (t.z > highestZ) {
            highestZ = t.z;
            frontCardName = card.title || card.type.replace('-', ' ').toUpperCase();
          }

          el.style.transform = `translate3d(${t.x}px, ${t.y}px, ${t.z}px) rotateX(${t.rotateX}deg) rotateY(${t.rotateY}deg) rotateZ(${t.rotateZ}deg) scale(${t.scale})`;
          el.style.zIndex = t.zIndex;
          el.style.opacity = t.opacity;
          el.style.filter = `brightness(${t.brightness}) drop-shadow(0 ${Math.max(4, 18 * (t.scale - 0.5))}px ${Math.max(8, 30 * (t.scale - 0.5))}px rgba(0, 0, 0, ${0.4 + 0.3 * (t.scale - 0.7)}))`;
        });

        if (frontCardName && frontCardName !== currentLeadTitle) {
          setCurrentLeadTitle(frontCardName);
        }
      }

      animId = requestAnimationFrame(updateFrame);
    };

    animId = requestAnimationFrame(updateFrame);
    return () => cancelAnimationFrame(animId);
  }, [cards, cyclePeriod, currentLeadTitle]);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const cycleSpeed = useCallback(() => {
    setSpeedMultiplier((prev) => (prev === 1 ? 1.5 : prev === 1.5 ? 0.5 : 1));
  }, []);

  const stepForward = useCallback(() => {
    progressRef.current = (progressRef.current + 1 / cards.length) % 1.0;
  }, [cards.length]);

  const stepBackward = useCallback(() => {
    progressRef.current = (progressRef.current - 1 / cards.length + 1.0) % 1.0;
  }, [cards.length]);

  const toggleRevolveMode = useCallback(() => {
    setRevolveMode((prev) => (prev === 'orbit' ? 'conveyor' : 'orbit'));
  }, []);

  return (
    <div
      className="video-collage-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header Overlay */}
      <div className="video-header-overlay">
        <div className="video-header-tag">3×3 Revolving Grid Matrix</div>
        <h1 className="video-header-title">
          {revolveMode === 'orbit' ? '3×3 Revolving Orbit Around Center' : '3×3 Perimeter Grid Conveyor'}
        </h1>
      </div>

      {/* 3D Perspective Viewport */}
      <div className="video-perspective-viewport">
        <div className="video-collage-stage is-revolving-grid">
          {cards.slice(0, 9).map((card, idx) => {
            const initialTransform = revolveMode === 'orbit'
              ? calculateRevolvingGrid3DTransform(0, idx)
              : calculateSlotConveyor3DTransform(0, idx);

            return (
              <div
                key={card.id}
                ref={(node) => {
                  if (node) cardElementsRef.current[card.id] = node;
                }}
                className={`video-card vcard-${card.type}`}
                style={{
                  width: `${UNIFORM_CARD_WIDTH}px`,
                  height: `${UNIFORM_CARD_HEIGHT}px`,
                  marginLeft: `-${UNIFORM_CARD_WIDTH / 2}px`,
                  marginTop: `-${UNIFORM_CARD_HEIGHT / 2}px`,
                  transform: `translate3d(${initialTransform.x}px, ${initialTransform.y}px, ${initialTransform.z}px) scale(${initialTransform.scale})`,
                  zIndex: initialTransform.zIndex,
                  opacity: initialTransform.opacity,
                }}
              >
                {renderVideoCard(card)}
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Ambient HUD */}
      <div className="video-hud">
        {/* Revolution Mode Switcher */}
        <button
          className={`video-hud-btn mode-btn active`}
          onClick={toggleRevolveMode}
          title="Toggle Revolution Pattern (Center Orbit vs Grid Slot Conveyor)"
        >
          {revolveMode === 'orbit' ? '⟳ 3×3 Orbit' : '⇄ 3×3 Grid Conveyor'}
        </button>

        <div className="video-hud-separator"></div>

        <button
          className={`video-hud-btn ${isPlaying ? 'active' : ''}`}
          onClick={togglePlay}
          title={isPlaying ? 'Pause Rotation' : 'Resume Rotation'}
        >
          {isPlaying ? '⏸ Pause' : '▶ Play'}
        </button>

        <button
          className="video-hud-btn"
          onClick={cycleSpeed}
          title="Toggle Speed"
        >
          ⚡ {speedMultiplier}x
        </button>

        <div className="video-hud-separator"></div>

        <button
          className="video-hud-btn"
          onClick={stepBackward}
          title="Step Backward"
        >
          ← Prev
        </button>

        <button
          className="video-hud-btn"
          onClick={stepForward}
          title="Step Forward"
        >
          Next →
        </button>

        <div className="video-hud-separator"></div>

        <div className="video-hud-name">
          In Focus: <strong>{currentLeadTitle}</strong>
        </div>
      </div>
    </div>
  );
};

export default VideoReferenceCollage;
