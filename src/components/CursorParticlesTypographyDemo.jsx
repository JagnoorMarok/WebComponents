import React, { useState } from "react";
import CursorDrivenParticleTypography from "./ui/cursor-driven-particles-typography";
import "./CursorParticlesTypographyDemo.css";

const PRESET_WORDS = [
  "DESIGN",
  "QUANTUM",
  "NEBULA",
  "SYNAPSE",
  "KINETIC",
  "VELOCITY",
];

const COLOR_PALETTES = [
  { name: "Pure White", value: "#ffffff" },
  { name: "Cyan Beam", value: "#38bdf8" },
  { name: "Neon Violet", value: "#c084fc" },
  { name: "Emerald Glint", value: "#34d399" },
  { name: "Sunset Amber", value: "#fb923c" },
  { name: "Rose Crimson", value: "#f43f5e" },
];

export function CursorParticlesTypographyDemo() {
  const [text, setText] = useState("DESIGN");
  const [particleDensity, setParticleDensity] = useState(4);
  const [dispersionStrength, setDispersionStrength] = useState(18);
  const [returnSpeed, setReturnSpeed] = useState(0.08);
  const [particleSize, setParticleSize] = useState(1.6);
  const [color, setColor] = useState("#ffffff");
  const [particleCount, setParticleCount] = useState(0);
  const [key, setKey] = useState(0); // Trigger re-init when needed

  const handleReset = () => {
    setText("DESIGN");
    setParticleDensity(4);
    setDispersionStrength(18);
    setReturnSpeed(0.08);
    setParticleSize(1.6);
    setColor("#ffffff");
    setKey((prev) => prev + 1);
  };

  return (
    <div className="cpt-demo-wrapper">
      {/* Header */}
      <div className="cpt-demo-header">
        <div className="cpt-demo-badge">
          <span className="cpt-badge-dot" />
          Interactive Canvas Physics
        </div>
        <h1 className="cpt-demo-title">Cursor Driven Particles Typography</h1>
        <p className="cpt-demo-subtitle">
          Dynamic typography synthesized from kinetic micro-particles. Hover to
          disperse particles with spring elasticity, or click to trigger a
          shockwave blast.
        </p>
      </div>

      {/* Main Interactive Stage */}
      <div className="cpt-stage-card">
        <div className="cpt-stage-header">
          <div className="cpt-stage-telemetry">
            <div className="cpt-telemetry-item">
              <span className="cpt-telemetry-dot" />
              <span>Particles:</span>
              <strong>{particleCount.toLocaleString()}</strong>
            </div>
            <div className="cpt-telemetry-item">
              <span>Dispersion:</span>
              <strong>{dispersionStrength}x</strong>
            </div>
            <div className="cpt-telemetry-item">
              <span>Return Spd:</span>
              <strong>{returnSpeed.toFixed(2)}</strong>
            </div>
          </div>

          <div className="cpt-stage-actions">
            <button
              className="cpt-action-btn"
              onClick={() => setKey((k) => k + 1)}
              title="Re-render particles"
            >
              Re-Assemble
            </button>
            <button
              className="cpt-action-btn"
              onClick={handleReset}
              title="Reset all settings to default"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Viewport */}
        <div className="cpt-canvas-viewport">
          <CursorDrivenParticleTypography
            key={`${text}-${color}-${particleDensity}-${particleSize}-${key}`}
            text={text}
            color={color}
            particleDensity={particleDensity}
            dispersionStrength={dispersionStrength}
            returnSpeed={returnSpeed}
            particleSize={particleSize}
            onParticleCountChange={setParticleCount}
          />

          <div className="cpt-stage-hint">
            <span className="cpt-hint-kbd">Hover</span> Disperse particles &bull;{" "}
            <span className="cpt-hint-kbd">Click</span> Shockwave burst
          </div>
        </div>
      </div>

      {/* Studio Controls Panel */}
      <div className="cpt-controls-panel">
        <div className="cpt-controls-grid">
          {/* Text & Presets */}
          <div className="cpt-control-group">
            <div className="cpt-control-label">
              <span>Typography Text</span>
              <span className="cpt-control-val">{text.length}/14</span>
            </div>
            <input
              type="text"
              className="cpt-text-input"
              value={text}
              maxLength={14}
              onChange={(e) => setText(e.target.value.toUpperCase() || "A")}
              placeholder="TYPE SOMETHING..."
            />
            <div className="cpt-presets-row">
              {PRESET_WORDS.map((word) => (
                <button
                  key={word}
                  className={`cpt-preset-chip ${text === word ? "active" : ""}`}
                  onClick={() => setText(word)}
                >
                  {word}
                </button>
              ))}
            </div>
          </div>

          {/* Color Palettes */}
          <div className="cpt-control-group">
            <div className="cpt-control-label">
              <span>Particle Color</span>
              <span className="cpt-control-val">{color}</span>
            </div>
            <div className="cpt-colors-row">
              {COLOR_PALETTES.map((pal) => (
                <button
                  key={pal.value}
                  className={`cpt-color-swatch ${color === pal.value ? "active" : ""}`}
                  style={{
                    backgroundColor: pal.value,
                    color: pal.value,
                  }}
                  onClick={() => setColor(pal.value)}
                  title={pal.name}
                  aria-label={pal.name}
                />
              ))}
            </div>
          </div>

          {/* Particle Density */}
          <div className="cpt-control-group">
            <div className="cpt-control-label">
              <span>Density (Step Size)</span>
              <span className="cpt-control-val">{particleDensity}px</span>
            </div>
            <input
              type="range"
              className="cpt-range-slider"
              min="3"
              max="8"
              step="1"
              value={particleDensity}
              onChange={(e) => setParticleDensity(Number(e.target.value))}
            />
            <span style={{ fontSize: "0.7rem", color: "#64748b" }}>
              Lower values create denser clouds with more particles.
            </span>
          </div>

          {/* Dispersion Strength */}
          <div className="cpt-control-group">
            <div className="cpt-control-label">
              <span>Dispersion Force</span>
              <span className="cpt-control-val">{dispersionStrength}</span>
            </div>
            <input
              type="range"
              className="cpt-range-slider"
              min="6"
              max="36"
              step="2"
              value={dispersionStrength}
              onChange={(e) => setDispersionStrength(Number(e.target.value))}
            />
          </div>

          {/* Return Speed */}
          <div className="cpt-control-group">
            <div className="cpt-control-label">
              <span>Elastic Return Velocity</span>
              <span className="cpt-control-val">{returnSpeed.toFixed(2)}</span>
            </div>
            <input
              type="range"
              className="cpt-range-slider"
              min="0.03"
              max="0.18"
              step="0.01"
              value={returnSpeed}
              onChange={(e) => setReturnSpeed(Number(e.target.value))}
            />
          </div>

          {/* Particle Dot Size */}
          <div className="cpt-control-group">
            <div className="cpt-control-label">
              <span>Particle Dot Radius</span>
              <span className="cpt-control-val">{particleSize}px</span>
            </div>
            <input
              type="range"
              className="cpt-range-slider"
              min="1"
              max="3.5"
              step="0.2"
              value={particleSize}
              onChange={(e) => setParticleSize(Number(e.target.value))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default CursorParticlesTypographyDemo;
