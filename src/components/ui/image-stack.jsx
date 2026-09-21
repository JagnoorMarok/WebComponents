import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import "./image-stack.css";

export function ImgStack({
  images = [],
  dragThreshold = 50,
  showControls = true,
  className = "",
}) {
  const [cards, setCards] = useState(() =>
    images.map((img, index) => ({
      id: index,
      src: typeof img === "string" ? img : img.src,
      alt: typeof img === "string" ? `Card ${index + 1}` : img.alt || `Card ${index + 1}`,
      tag: typeof img === "string" ? `0${index + 1}` : img.tag || `0${index + 1}`,
      zIndex: 50 - index * 10,
    }))
  );

  useEffect(() => {
    setCards(
      images.map((img, index) => ({
        id: index,
        src: typeof img === "string" ? img : img.src,
        alt: typeof img === "string" ? `Card ${index + 1}` : img.alt || `Card ${index + 1}`,
        tag: typeof img === "string" ? `0${index + 1}` : img.tag || `0${index + 1}`,
        zIndex: 50 - index * 10,
      }))
    );
  }, [images]);

  const [isCycling, setIsCycling] = useState(false);
  const dragStartPoint = useRef({ x: 0, y: 0 });

  const getCardStyles = (index) => ({
    x: index * -12,
    y: index * -8,
    rotate: index === 0 ? 0 : -(2 + index * 3),
    scale: 1 - index * 0.03,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
  });

  const cycleNext = () => {
    if (isCycling || cards.length <= 1) return;
    setIsCycling(true);
    setCards((prev) => {
      const next = [...prev];
      const top = next.shift();
      if (top) next.push(top);
      return next.map((card, idx) => ({
        ...card,
        zIndex: 50 - idx * 10,
      }));
    });
    setTimeout(() => {
      setIsCycling(false);
    }, 300);
  };

  const cyclePrev = () => {
    if (isCycling || cards.length <= 1) return;
    setIsCycling(true);
    setCards((prev) => {
      const next = [...prev];
      const last = next.pop();
      if (last) next.unshift(last);
      return next.map((card, idx) => ({
        ...card,
        zIndex: 50 - idx * 10,
      }));
    });
    setTimeout(() => {
      setIsCycling(false);
    }, 300);
  };

  const handleDragStart = (e, info) => {
    dragStartPoint.current = { x: info.point.x, y: info.point.y };
  };

  const handleDragEnd = (e, info) => {
    const distance = Math.sqrt(
      Math.pow(info.point.x - dragStartPoint.current.x, 2) +
      Math.pow(info.point.y - dragStartPoint.current.y, 2)
    );

    if (!isCycling && distance >= dragThreshold) {
      cycleNext();
    }
  };

  const activeOriginalIndex = cards[0]?.id ?? 0;

  return (
    <div className={`image-stack-container ${className}`}>
      {/* 3D Drag Stage */}
      <div className="image-stack-stage">
        {cards.map((card, index) => {
          const isTop = index === 0;
          const cardStyle = getCardStyles(index);
          const canDrag = isTop && !isCycling && cards.length > 1;

          return (
            <motion.div
              key={card.id}
              className={`image-stack-card ${!canDrag ? "not-interactive" : ""}`}
              style={{
                zIndex: card.zIndex,
                aspectRatio: "5/7",
              }}
              animate={cardStyle}
              drag={canDrag}
              dragElastic={0.25}
              dragConstraints={{ left: -180, right: 180, top: -180, bottom: 180 }}
              dragSnapToOrigin={true}
              dragTransition={{ bounceStiffness: 550, bounceDamping: 14 }}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              whileHover={isTop ? { scale: 1.04, transition: { duration: 0.2 } } : {}}
              whileDrag={{
                scale: 1.08,
                rotate: 0,
                zIndex: 100,
                boxShadow: "0 30px 60px -10px rgba(0, 0, 0, 0.65)",
                transition: { duration: 0.1 },
              }}
            >
              <img
                src={card.src}
                alt={card.alt}
                className="image-stack-img"
                draggable={false}
              />
              <div className="image-stack-gloss" aria-hidden="true" />
              <span className="image-stack-card-badge">{card.tag}</span>
            </motion.div>
          );
        })}
      </div>

      {/* Footer Indicators & Optional Controls */}
      {showControls && cards.length > 1 && (
        <div className="image-stack-footer">
          <div className="image-stack-hint">
            <span className="image-stack-hint-icon">👉</span>
            <span>Drag card to cycle</span>
          </div>

          <div className="image-stack-nav-row">
            <button
              type="button"
              className="image-stack-btn"
              onClick={cyclePrev}
              title="Previous card"
              aria-label="Previous card"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            {/* Dots */}
            <div className="image-stack-dots">
              {images.map((_, i) => (
                <span
                  key={i}
                  className={`image-stack-dot ${activeOriginalIndex === i ? "active" : ""}`}
                />
              ))}
            </div>

            <button
              type="button"
              className="image-stack-btn"
              onClick={cycleNext}
              title="Next card"
              aria-label="Next card"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ImgStack;
