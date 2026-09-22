import React, { useRef, useState } from "react";
import { AsciiRipple } from "./ui/ascii-ripple";
import "./AsciiRippleDemo.css";

const THEMES = [
  {
    name: "Cyber Violet",
    textColor: "#f5f5f4",
    rippleColor: "#ffffff",
    troughColor: "#ad57ff",
  },
  {
    name: "Matrix Emerald",
    textColor: "#86efac",
    rippleColor: "#bbf7d0",
    troughColor: "#15803d",
  },
  {
    name: "Ocean Azure",
    textColor: "#bae6fd",
    rippleColor: "#ffffff",
    troughColor: "#0284c7",
  },
  {
    name: "Solar Amber",
    textColor: "#fde68a",
    rippleColor: "#ffffff",
    troughColor: "#d97706",
  },
  {
    name: "Monochrome Noir",
    textColor: "#a1a1aa",
    rippleColor: "#ffffff",
    troughColor: "#3f3f46",
  },
];

const GLYPH_PRESETS = [
  { label: "Classic Curve", chars: "·.,:;-~=+*%#@" },
  { label: "Dense Blocks", chars: " ░▒▓█" },
  { label: "Cyber Binary", chars: " 01" },
  { label: "Sparse Dots", chars: " ·:;*#" },
];

const TEXT_PRESETS = [
  {
    label: "Ocean Tide",
    text: "Low tide leaves the rock shelf glazed and quiet, and the pools that remain are small enough to hold in one long look. A shrimp no bigger than a comma drifts above the sand, its shadow arriving a moment before it does. The surface is a second sky. Cloud passes through it, then a gull, then the tremble of my own breath as I lean too close. Nothing here is still, only slow. Anemones open with the patience of clocks. Weed lifts and settles as though the water were remembering a wave it once carried farther up the shore. When a drop falls from my sleeve the whole pool answers at once, rings running outward until they meet the stone and come back folded over themselves, smaller, quieter, braided into a pattern that was never quite round. Light bends through the moving glass and the sand below it wavers, letters on a page read through tears. I count the returns. Four, five, then the surface forgets and the sky is whole again. Farther out the real sea keeps its own time, heavy and unhurried, sending the same news up the channel it has always sent. The pool listens. It repeats every word in a smaller voice, and then, when it is sure no one is watching, it goes back to being a mirror.",
  },
  {
    label: "Cyber Grid",
    text: "Signals propagate through silicon corridors. Monospace arrays undulate like digital mercury under electric fingertips. In the terminal void, code ripples across space and time. Packets disperse in concentric rings across fiber arteries. Memory addresses fracture and recombine into dense typographic lattices. The machine dreams in floating-point waves.",
  },
  {
    label: "Matrix Cipher",
    text: "Wake up Neo. The Matrix has you. Follow the white rabbit. Knock knock Neo. There is no spoon. It is not the spoon that bends, it is only yourself. What is real? How do you define real? If you are talking about what you can feel, what you can smell, what you can taste and see, then real is simply electrical signals interpreted by your brain.",
  },
];

export function AsciiRippleDemo() {
  const rippleRef = useRef(null);

  const [themeIdx, setThemeIdx] = useState(0);
  const [glyphIdx, setGlyphIdx] = useState(0);
  const [textIdx, setTextIdx] = useState(0);

  const [speed, setSpeed] = useState(0.55);
  const [damping, setDamping] = useState(0.045);
  const [viscosity, setViscosity] = useState(0.4);
  const [refraction, setRefraction] = useState(4);
  const [sensitivity, setSensitivity] = useState(2.2);
  const [slopeGain, setSlopeGain] = useState(1);
  const [scramble, setScramble] = useState(1);
  const [dropStrength, setDropStrength] = useState(1.2);
  const [dropRadius, setDropRadius] = useState(26);
  const [edges, setEdges] = useState("absorb");
  const [rain, setRain] = useState(0);
  const [fontSize, setFontSize] = useState(16);
  const [textOpacity, setTextOpacity] = useState(0.18);

  const activeTheme = THEMES[themeIdx];
  const activeChars = GLYPH_PRESETS[glyphIdx].chars;
  const activeText = TEXT_PRESETS[textIdx].text;

  const handleRandomSplash = () => {
    if (!rippleRef.current) return;
    const stage = document.querySelector(".ar-canvas-area");
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const rx = Math.random() * rect.width;
    const ry = Math.random() * rect.height;
    rippleRef.current.drop(rx, ry, dropStrength * 1.3, dropRadius * 1.2);
  };

  const handleCalm = () => {
    if (rippleRef.current) {
      rippleRef.current.calm();
    }
  };

  const handleReset = () => {
    setThemeIdx(0);
    setGlyphIdx(0);
    setTextIdx(0);
    setSpeed(0.55);
    setDamping(0.045);
    setViscosity(0.4);
    setRefraction(4);
    setSensitivity(2.2);
    setSlopeGain(1);
    setScramble(1);
    setDropStrength(1.2);
    setDropRadius(26);
    setEdges("absorb");
    setRain(0);
    setFontSize(16);
    setTextOpacity(0.18);
    handleCalm();
  };

  return (
    <div className="ar-demo-container">
      {/* Header */}
      <div className="ar-demo-header">
        <div className="ar-demo-badge">
          <span className="ar-badge-dot"></span>
          Simulated Liquid Typography
        </div>
        <h1 className="ar-demo-title">ASCII Ripple</h1>
        <p className="ar-demo-subtitle">
          Monospace text behaving like a liquid surface. Pointer drops and drags
          send simulated 2D finite-difference wave fronts bending words and
          blooming into heavier glyphs.
        </p>
      </div>

      {/* Stage Card */}
      <div className="ar-stage-card">
        <div className="ar-stage-toolbar">
          <div className="ar-stage-telemetry">
            <span className="ar-telemetry-dot"></span>
            <span className="ar-telemetry-item">
              Theme: <strong>{activeTheme.name}</strong>
            </span>
            <span className="ar-telemetry-item">
              Boundary: <strong>{edges.toUpperCase()}</strong>
            </span>
            <span className="ar-telemetry-item">
              Rain: <strong>{rain > 0 ? `${rain}/s` : "OFF"}</strong>
            </span>
            <span className="ar-telemetry-item">
              Refraction: <strong>{refraction}x</strong>
            </span>
          </div>

          <div className="ar-actions-row">
            <button
              type="button"
              className="ar-btn-action"
              onClick={handleRandomSplash}
              title="Spawn a splash drop"
            >
              ✦ Splash
            </button>
            <button
              type="button"
              className={`ar-btn-action ${rain > 0 ? "active" : ""}`}
              onClick={() => setRain(rain > 0 ? 0 : 2)}
              title="Toggle ambient rain drops"
            >
              🌧 Rain {rain > 0 ? "On" : "Off"}
            </button>
            <button
              type="button"
              className="ar-btn-action"
              onClick={handleCalm}
              title="Instantly calm the water surface"
            >
              Calm Surface
            </button>
            <button
              type="button"
              className="ar-btn-action"
              onClick={handleReset}
              title="Reset all settings to defaults"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Live Canvas Area */}
        <div className="ar-canvas-area">
          <AsciiRipple
            ref={rippleRef}
            text={activeText}
            chars={activeChars}
            fontSize={fontSize}
            lineHeight={1.2}
            textColor={activeTheme.textColor}
            rippleColor={activeTheme.rippleColor}
            troughColor={activeTheme.troughColor}
            textOpacity={textOpacity}
            speed={speed}
            damping={damping}
            viscosity={viscosity}
            edges={edges}
            dropStrength={dropStrength}
            dropRadius={dropRadius}
            dragStrength={0.3}
            dragRadius={16}
            rain={rain}
            rainStrength={0.6}
            sensitivity={sensitivity}
            slopeGain={slopeGain}
            refraction={refraction}
            scramble={scramble}
            scrambleSpeed={90}
            dither={0.5}
            vignette={0.6}
            interactive={true}
          />

          <div className="ar-canvas-hint">
            <span className="ar-hint-badge">Click or Drag</span>
            to disturb the monospace liquid surface
          </div>
        </div>
      </div>

      {/* Studio Controls Panel */}
      <div className="ar-controls-panel">
        <div className="ar-controls-grid">
          {/* Theme Palette */}
          <div className="ar-control-group">
            <div className="ar-control-label">
              <span>Color Atmosphere</span>
              <span className="ar-control-val">{activeTheme.name}</span>
            </div>
            <div className="ar-colors-row">
              {THEMES.map((theme, idx) => (
                <button
                  key={theme.name}
                  type="button"
                  className={`ar-color-pill ${themeIdx === idx ? "active" : ""}`}
                  onClick={() => setThemeIdx(idx)}
                >
                  <span
                    className="ar-swatch-dot"
                    style={{ backgroundColor: theme.troughColor }}
                  />
                  {theme.name.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Glyph Set */}
          <div className="ar-control-group">
            <div className="ar-control-label">
              <span>ASCII Density Ramp</span>
              <span className="ar-control-val">
                {GLYPH_PRESETS[glyphIdx].label}
              </span>
            </div>
            <div className="ar-chips-row">
              {GLYPH_PRESETS.map((p, idx) => (
                <button
                  key={p.label}
                  type="button"
                  className={`ar-chip-btn ${glyphIdx === idx ? "active" : ""}`}
                  onClick={() => setGlyphIdx(idx)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Text Passage */}
          <div className="ar-control-group">
            <div className="ar-control-label">
              <span>Text Passage</span>
              <span className="ar-control-val">
                {TEXT_PRESETS[textIdx].label}
              </span>
            </div>
            <div className="ar-chips-row">
              {TEXT_PRESETS.map((p, idx) => (
                <button
                  key={p.label}
                  type="button"
                  className={`ar-chip-btn ${textIdx === idx ? "active" : ""}`}
                  onClick={() => setTextIdx(idx)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Edge Boundary */}
          <div className="ar-control-group">
            <div className="ar-control-label">
              <span>Edge Boundary Condition</span>
              <span className="ar-control-val">{edges}</span>
            </div>
            <div className="ar-chips-row">
              <button
                type="button"
                className={`ar-chip-btn ${edges === "absorb" ? "active" : ""}`}
                onClick={() => setEdges("absorb")}
              >
                Absorb (Damped Edges)
              </button>
              <button
                type="button"
                className={`ar-chip-btn ${edges === "reflect" ? "active" : ""}`}
                onClick={() => setEdges("reflect")}
              >
                Reflect (Bouncing Waves)
              </button>
            </div>
          </div>

          {/* Wave Speed */}
          <div className="ar-control-group">
            <div className="ar-control-label">
              <span>Wave Speed</span>
              <span className="ar-control-val">{speed.toFixed(2)}</span>
            </div>
            <input
              type="range"
              className="ar-range-slider"
              min="0.1"
              max="1.0"
              step="0.01"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
            />
          </div>

          {/* Viscosity */}
          <div className="ar-control-group">
            <div className="ar-control-label">
              <span>Surface Viscosity</span>
              <span className="ar-control-val">{viscosity.toFixed(2)}</span>
            </div>
            <input
              type="range"
              className="ar-range-slider"
              min="0.0"
              max="0.8"
              step="0.01"
              value={viscosity}
              onChange={(e) => setViscosity(Number(e.target.value))}
            />
          </div>

          {/* Damping */}
          <div className="ar-control-group">
            <div className="ar-control-label">
              <span>Wave Damping</span>
              <span className="ar-control-val">{damping.toFixed(3)}</span>
            </div>
            <input
              type="range"
              className="ar-range-slider"
              min="0.01"
              max="0.15"
              step="0.005"
              value={damping}
              onChange={(e) => setDamping(Number(e.target.value))}
            />
          </div>

          {/* Refraction */}
          <div className="ar-control-group">
            <div className="ar-control-label">
              <span>Optical Refraction</span>
              <span className="ar-control-val">{refraction.toFixed(1)} cells</span>
            </div>
            <input
              type="range"
              className="ar-range-slider"
              min="0.0"
              max="6.0"
              step="0.1"
              value={refraction}
              onChange={(e) => setRefraction(Number(e.target.value))}
            />
          </div>

          {/* Sensitivity & Slope */}
          <div className="ar-control-group">
            <div className="ar-control-label">
              <span>Intensity Sensitivity</span>
              <span className="ar-control-val">{sensitivity.toFixed(1)}</span>
            </div>
            <input
              type="range"
              className="ar-range-slider"
              min="0.5"
              max="5.0"
              step="0.1"
              value={sensitivity}
              onChange={(e) => setSensitivity(Number(e.target.value))}
            />
          </div>

          {/* Drop Strength */}
          <div className="ar-control-group">
            <div className="ar-control-label">
              <span>Drop Strength & Radius</span>
              <span className="ar-control-val">
                {dropStrength.toFixed(1)} / {dropRadius}px
              </span>
            </div>
            <input
              type="range"
              className="ar-range-slider"
              min="0.4"
              max="3.0"
              step="0.1"
              value={dropStrength}
              onChange={(e) => setDropStrength(Number(e.target.value))}
            />
          </div>

          {/* Font Size & Resting Opacity */}
          <div className="ar-control-group">
            <div className="ar-control-label">
              <span>Font Size & Resting Opacity</span>
              <span className="ar-control-val">
                {fontSize}px ({Math.round(textOpacity * 100)}%)
              </span>
            </div>
            <input
              type="range"
              className="ar-range-slider"
              min="12"
              max="24"
              step="1"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AsciiRippleDemo;
