import React, { useState, useEffect, useCallback, useRef } from 'react';
import { collageCards, collageLayouts } from '../data/collageCardsData';
import './AnimatedCardCollage.css';

/**
 * Renders individual card content according to card type
 */
function renderCardContent(card) {
  switch (card.type) {
    case 'thu':
      return (
        <>
          <img src={card.image} alt="Editorial THU" className="photo-bg" />
          <div className="photo-overlay">
            <p>EDITION // AUTUMN</p>
            <div>
              <h2>{card.title}</h2>
              <p>{card.subtitle}</p>
            </div>
          </div>
        </>
      );

    case 'nov2026':
      return (
        <>
          <img src={card.image} alt="Architecture 2026" className="card-arch-img" />
          <div className="card-inner-pad">
            <div className="top-row">
              <span>{card.category}</span>
              <span>● ACTIVE</span>
            </div>
            <div>
              <h2>{card.title}</h2>
              <div className="sub">{card.subtitle}</div>
            </div>
          </div>
        </>
      );

    case 'natural-fresh':
      return (
        <>
          <div className="pill-indicator">
            <span className="dot"></span>
            <span>{card.tag}</span>
          </div>
          <h2>
            {card.title}
            <span>{card.subtitle}</span>
          </h2>
          <div className="bot-pattern">
            <span>NO. 082</span>
            <span>PURE ORGANIC</span>
          </div>
        </>
      );

    case 'stat-12k':
      return (
        <>
          <div className="code">{card.code}</div>
          <div className="big-stat">{card.title}</div>
          <div className="stat-label">{card.subtitle}</div>
        </>
      );

    case 'ave-0316':
      return (
        <>
          <div>
            <div className="ave-title">{card.title}</div>
            <div className="ave-sub">{card.subtitle}</div>
          </div>
          <div className="barcode-row">
            <div className="mock-barcode">
              <span></span><span></span><span></span><span></span><span></span>
              <span></span><span></span><span></span><span></span><span></span>
              <span></span><span></span>
            </div>
            <span className="tag-chip">ZONE A</span>
          </div>
        </>
      );

    case 'ultimate-taste':
      return (
        <>
          <div className="top-meta">{card.edition} — CURATED</div>
          <h3>
            {card.title}
            <strong>{card.subtitle}</strong>
          </h3>
          <div className="bottom-meta">
            <span>EST. 2026</span>
            <span>TASTE LAB</span>
          </div>
        </>
      );

    case 'cities':
      return (
        <>
          <div className="cities-label">REGIONAL CIRCUIT</div>
          <div className="city-list">
            {card.cities.map((city, idx) => (
              <span key={idx} className="city-item">{city}</span>
            ))}
          </div>
        </>
      );

    case 'geometry':
      return (
        <>
          <svg viewBox="0 0 100 100" fill="none" stroke="currentColor">
            <circle cx="50" cy="50" r="38" stroke="#4a5e50" strokeWidth="1.5" strokeDasharray="3 3" />
            <circle cx="50" cy="50" r="28" stroke="#779680" strokeWidth="1.5" />
            <circle cx="50" cy="50" r="16" stroke="#9bbba3" strokeWidth="1" />
            <line x1="12" y1="50" x2="88" y2="50" stroke="#4a5e50" strokeWidth="1" opacity="0.6" />
            <line x1="50" y1="12" x2="50" y2="88" stroke="#4a5e50" strokeWidth="1" opacity="0.6" />
          </svg>
          <span className="geom-label">{card.title}</span>
        </>
      );

    case 'photo-portrait':
    case 'photo-arch':
    case 'raw-texture':
      return (
        <>
          <img src={card.image} alt={card.caption} />
          <span className="photo-tag">{card.caption}</span>
        </>
      );

    case 'mono-dot':
      return (
        <>
          <div className="circle-mark"></div>
          <div className="mono-code">{card.code}</div>
        </>
      );

    case 'specs':
      return (
        <>
          <div className="specs-title">{card.title}</div>
          <div className="specs-coords">{card.coords}</div>
        </>
      );

    case 'studio-tag':
      return (
        <>
          <div className="label">{card.label}</div>
          <div className="ed">{card.edition}</div>
        </>
      );

    case 'typo-m':
      return (
        <>
          <div className="big-letter">{card.letter}</div>
          <div className="meta-word">{card.title}</div>
        </>
      );

    case 'pill-tag':
      return <span>● {card.text}</span>;

    case 'index-88':
      return (
        <>
          <div className="num">{card.num}</div>
          <div className="sub">{card.label}</div>
        </>
      );

    default:
      return <div>{card.title || 'Card'}</div>;
  }
}

const AnimatedCardCollage = ({
  cards = collageCards,
  layouts = collageLayouts,
  autoPlay = true,
  interval = 3200,
  transitionDuration = 2.3,
}) => {
  const [layoutIndex, setLayoutIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [isHovered, setIsHovered] = useState(false);

  const isPlayingRef = useRef(isPlaying);
  const speedRef = useRef(speedMultiplier);
  const isHoveredRef = useRef(isHovered);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
    speedRef.current = speedMultiplier;
    isHoveredRef.current = isHovered;
  }, [isPlaying, speedMultiplier, isHovered]);

  const nextLayout = useCallback(() => {
    setLayoutIndex((prev) => (prev + 1) % layouts.length);
  }, [layouts.length]);

  const prevLayout = useCallback(() => {
    setLayoutIndex((prev) => (prev - 1 + layouts.length) % layouts.length);
  }, [layouts.length]);

  const goToLayout = useCallback((idx) => {
    setLayoutIndex(idx);
  }, []);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const cycleSpeed = useCallback(() => {
    setSpeedMultiplier((prev) => (prev === 1 ? 1.5 : prev === 1.5 ? 0.6 : 1));
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    const currentInterval = interval / speedMultiplier;
    const timer = setInterval(() => {
      if (!isHoveredRef.current) {
        nextLayout();
      }
    }, currentInterval);

    return () => clearInterval(timer);
  }, [isPlaying, interval, speedMultiplier, nextLayout]);

  const currentLayout = layouts[layoutIndex] || layouts[0];
  const positions = currentLayout.positions;
  const currentDuration = transitionDuration / speedMultiplier;

  return (
    <div
      className="collage-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="collage-header-overlay">
        <div className="collage-header-tag">2D Animated Moodboard</div>
        <h1 className="collage-header-title">Editorial Living Collage</h1>
      </div>

      <div className="collage-stage-wrapper">
        {cards.map((card) => {
          const pos = positions[card.id] || { x: 0, y: 0, rotate: 0, scale: 1, zIndex: 1, delay: 0 };
          const scaledDelay = (pos.delay || 0) / speedMultiplier;

          return (
            <div
              key={card.id}
              className={`collage-card card-theme-${card.theme}`}
              style={{
                width: `${card.width}px`,
                height: `${card.height}px`,
                marginLeft: `-${card.width / 2}px`,
                marginTop: `-${card.height / 2}px`,
                transform: `translate3d(${pos.x}px, ${pos.y}px, 0) rotate(${pos.rotate}deg) scale(${pos.scale || 1})`,
                zIndex: pos.zIndex,
                '--delay': `${scaledDelay}ms`,
                '--trans-duration': `${currentDuration}s`,
              }}
            >
              {renderCardContent(card)}
            </div>
          );
        })}
      </div>

      <div className="collage-hud">
        <button
          className={`collage-hud-btn ${isPlaying ? 'active' : ''}`}
          onClick={togglePlay}
          title={isPlaying ? 'Pause Animation' : 'Resume Animation'}
        >
          {isPlaying ? '⏸ Pause' : '▶ Play'}
        </button>

        <button
          className="collage-hud-btn"
          onClick={cycleSpeed}
          title="Toggle Choreography Speed"
        >
          ⚡ {speedMultiplier}x
        </button>

        <div className="collage-hud-separator"></div>

        <button
          className="collage-hud-btn"
          onClick={prevLayout}
          title="Previous Layout"
        >
          ← Prev
        </button>

        <button
          className="collage-hud-btn"
          onClick={nextLayout}
          title="Next Layout"
        >
          Next →
        </button>

        <div className="collage-hud-separator"></div>

        <div className="collage-hud-dots">
          {layouts.map((l, i) => (
            <div
              key={i}
              className={`collage-hud-dot ${i === layoutIndex ? 'active' : ''}`}
              onClick={() => goToLayout(i)}
              title={`Switch to ${l.name}`}
            />
          ))}
        </div>

        <div className="collage-hud-name">
          {currentLayout.name} ({layoutIndex + 1}/{layouts.length})
        </div>
      </div>
    </div>
  );
};

export default AnimatedCardCollage;
