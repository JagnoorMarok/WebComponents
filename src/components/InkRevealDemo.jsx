import React, { useState } from "react";
import InkReveal from "./ui/ink-reveal";

const PRESETS = [
  {
    id: "landscape",
    name: "Alpine Mist",
    type: "image",
    src: "/assets/ink-reveal/landscape.jpg",
    maskColor: [14, 14, 18],
    headline: "Hidden Horizons",
    subline: "Brush over the canvas to dissolve the mist and uncover the alpine peaks underneath.",
  },
  {
    id: "neon",
    name: "Cyber Tokyo",
    type: "image",
    src: "/assets/ink-reveal/neon-city.jpg",
    maskColor: [8, 8, 12],
    headline: "Neon Noir",
    subline: "Paint across the dark veil to reveal the glowing electric rain of Tokyo.",
  },
  {
    id: "typography",
    name: "Typography Vault",
    type: "typography",
    maskColor: [12, 12, 16],
    headline: "Cryptic Blueprint",
    subline: "Sweep through the void to expose the hidden geometric typography manifesto.",
  },
];

export default function InkRevealDemo() {
  const [activePreset, setActivePreset] = useState(PRESETS[0]);
  const [brushSize, setBrushSize] = useState(130);
  const [lifetime, setLifetime] = useState(850);
  const [showCursor, setShowCursor] = useState(true);

  return (
    <div style={{ width: "100%", maxWidth: "1100px", margin: "0 auto", padding: "0 16px 80px" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: "#ffffff",
            marginBottom: "10px",
          }}
        >
          Ink Reveal
        </h1>
        <p
          style={{
            fontSize: "1rem",
            color: "rgba(255, 255, 255, 0.6)",
            maxWidth: "640px",
            margin: "0 auto 24px",
            lineHeight: 1.6,
          }}
        >
          An organic canvas overlay using destination-out compositing, sinusoidal harmonic wobble,
          and cubic ease expansion to fluidly dissolve a colored mask and reveal content beneath.
        </p>

        {/* Controls Bar */}
        <div
          style={{
            display: "inline-flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "14px",
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "14px",
            padding: "14px 22px",
            backdropFilter: "blur(12px)",
          }}
        >
          {/* Preset Buttons */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: "10px" }}>
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
              Underlayer:
            </span>
            {PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setActivePreset(p)}
                style={{
                  padding: "6px 14px",
                  fontSize: "13px",
                  fontWeight: 500,
                  borderRadius: "8px",
                  border: "1px solid",
                  borderColor: activePreset.id === p.id ? "#ffffff" : "rgba(255,255,255,0.12)",
                  background: activePreset.id === p.id ? "#ffffff" : "rgba(255,255,255,0.06)",
                  color: activePreset.id === p.id ? "#000000" : "#d4d4d8",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                {p.name}
              </button>
            ))}
          </div>

          {/* Sliders */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "center",
              gap: "20px",
              paddingTop: "6px",
              borderTop: "1px solid rgba(255, 255, 255, 0.06)",
              width: "100%",
            }}
          >
            {/* Brush Size Slider */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#a1a1aa" }}>
              <span>Brush:</span>
              <input
                type="range"
                min="60"
                max="220"
                step="10"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                style={{ width: "80px", accentColor: "#ffffff", cursor: "pointer" }}
              />
              <span style={{ color: "#ffffff", minWidth: "38px", textAlign: "left" }}>{brushSize}px</span>
            </div>

            {/* Lifetime Slider */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#a1a1aa" }}>
              <span>Heal Time:</span>
              <input
                type="range"
                min="400"
                max="1800"
                step="50"
                value={lifetime}
                onChange={(e) => setLifetime(Number(e.target.value))}
                style={{ width: "80px", accentColor: "#ffffff", cursor: "pointer" }}
              />
              <span style={{ color: "#ffffff", minWidth: "42px", textAlign: "left" }}>{(lifetime / 1000).toFixed(1)}s</span>
            </div>

            {/* Cursor Toggle */}
            <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#e4e4e7", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={showCursor}
                onChange={(e) => setShowCursor(e.target.checked)}
                style={{ accentColor: "#ffffff", cursor: "pointer" }}
              />
              Ink Guide Ring
            </label>

            {/* Reset */}
            <button
              type="button"
              onClick={() => {
                setBrushSize(130);
                setLifetime(850);
                setShowCursor(true);
              }}
              style={{
                background: "transparent",
                border: "none",
                color: "rgba(255,255,255,0.4)",
                fontSize: "12px",
                cursor: "pointer",
                padding: "2px 6px",
                textDecoration: "underline",
              }}
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div
        className="ink-reveal-wrapper"
        style={{
          height: "560px",
        }}
      >
        {/* Underlying Content Being Revealed */}
        {activePreset.type === "image" ? (
          <img
            src={activePreset.src}
            alt={activePreset.name}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <div
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #09090e 0%, #1e1b4b 50%, #31104b 100%)",
              color: "#ffffff",
              padding: "32px",
              textAlign: "center",
            }}
          >
            <span
              style={{
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                color: "#a855f7",
                fontWeight: 700,
                marginBottom: "12px",
              }}
            >
              SECRET TRANSMISSION REVEALED
            </span>
            <h2
              style={{
                fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                margin: "0 0 16px 0",
                background: "linear-gradient(to right, #ffffff, #c084fc, #38bdf8)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              THE FUTURE IS CODE
            </h2>
            <p
              style={{
                fontSize: "1.1rem",
                color: "rgba(255, 255, 255, 0.75)",
                maxWidth: "600px",
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              Hardware-accelerated rendering, procedural wave math, and fluid interactive physics crafted with pure React.
            </p>
          </div>
        )}

        {/* Ink Reveal Canvas Overlay */}
        <InkReveal
          maskColor={activePreset.maskColor}
          brushSize={brushSize}
          lifetime={lifetime}
          showCustomCursor={showCursor}
        />

        {/* Top Tag */}
        <div className="ink-reveal-badge">
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#a855f7", display: "inline-block" }} />
          <span>DESTINATION-OUT MASK</span>
        </div>

        {/* Floating Instruction */}
        <div className="ink-reveal-hint-pill">
          <span className="ink-reveal-hint-dot" />
          <span>Brush or drag cursor to reveal</span>
        </div>
      </div>
    </div>
  );
}
