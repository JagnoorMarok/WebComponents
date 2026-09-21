import React, { useState } from "react";
import { InterfaceCraftsCards } from "./ui/interface-crafts-cards.jsx";

const SPRING_PRESETS = {
  bouncy: {
    type: "spring",
    visualDuration: 0.6,
    bounce: 0.35,
  },
  gentle: {
    type: "spring",
    visualDuration: 0.7,
    bounce: 0.15,
  },
  snappy: {
    type: "spring",
    visualDuration: 0.45,
    bounce: 0.2,
  },
};

export default function InterfaceCraftsDemo() {
  const [cardSpacing, setCardSpacing] = useState(180);
  const [activeScale, setActiveScale] = useState(1.15);
  const [springKey, setSpringKey] = useState("bouncy");

  const handleReset = () => {
    setCardSpacing(180);
    setActiveScale(1.15);
    setSpringKey("bouncy");
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh", overflow: "hidden" }}>
      {/* Top Floating Hint */}
      <div className="interface-crafts-hint">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
        <span>Click any card to inspect · Click canvas to collapse</span>
      </div>

      <InterfaceCraftsCards
        cardSpacing={cardSpacing}
        activeScale={activeScale}
        spring={SPRING_PRESETS[springKey]}
      />

      {/* Bottom Controls HUD */}
      <div className="wispr-controls-hud" style={{ bottom: "2rem" }}>
        <div className="wispr-hud-group">
          <span className="wispr-hud-label">Spacing</span>
          <input
            type="range"
            min="80"
            max="260"
            step="10"
            value={cardSpacing}
            onChange={(e) => setCardSpacing(Number(e.target.value))}
            className="wispr-hud-slider"
            title={`Card Spacing: ${cardSpacing}px`}
          />
        </div>

        <div className="wispr-hud-group">
          <span className="wispr-hud-label">Scale</span>
          <input
            type="range"
            min="1.05"
            max="1.3"
            step="0.05"
            value={activeScale}
            onChange={(e) => setActiveScale(Number(e.target.value))}
            className="wispr-hud-slider"
            title={`Active Scale: ${activeScale}x`}
          />
        </div>

        <div className="wispr-hud-group" style={{ gap: "4px" }}>
          <span className="wispr-hud-label">Spring</span>
          <button
            className="wispr-hud-btn"
            style={{
              background: springKey === "bouncy" ? "rgba(249, 115, 22, 0.25)" : undefined,
              borderColor: springKey === "bouncy" ? "#f97316" : undefined,
            }}
            onClick={() => setSpringKey("bouncy")}
          >
            Bouncy
          </button>
          <button
            className="wispr-hud-btn"
            style={{
              background: springKey === "gentle" ? "rgba(249, 115, 22, 0.25)" : undefined,
              borderColor: springKey === "gentle" ? "#f97316" : undefined,
            }}
            onClick={() => setSpringKey("gentle")}
          >
            Gentle
          </button>
          <button
            className="wispr-hud-btn"
            style={{
              background: springKey === "snappy" ? "rgba(249, 115, 22, 0.25)" : undefined,
              borderColor: springKey === "snappy" ? "#f97316" : undefined,
            }}
            onClick={() => setSpringKey("snappy")}
          >
            Snappy
          </button>
        </div>

        <button
          className="wispr-hud-btn"
          onClick={handleReset}
          title="Reset to default spacing and scale"
          style={{ display: "flex", alignItems: "center", gap: "4px" }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1 4 1 10 7 10"></polyline>
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
          </svg>
          <span>Reset</span>
        </button>
      </div>
    </div>
  );
}
