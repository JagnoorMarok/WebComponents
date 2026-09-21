import React, { useState } from "react";
import KineticText from "./ui/kinetic-text";
import "./KineticTextDemo.css";

const FONT_OPTIONS = [
  { name: "Jakarta Sans", family: "'Plus Jakarta Sans', sans-serif" },
  { name: "Syne Display", family: "'Syne', sans-serif" },
  { name: "Space Grotesk", family: "'Space Grotesk', sans-serif" },
  { name: "Cinzel Serif", family: "'Cinzel', serif" },
];

const SAMPLE_WORDS = [
  "NOSTALGIA",
  "AVANT-GARDE",
  "KINETIC",
  "CYBERNETIC",
  "PRECISION",
];

const COLOR_SWATCHES = [
  { name: "Obsidian White", value: "#ffffff" },
  { name: "Sky Cyan", value: "#38bdf8" },
  { name: "Acid Lime", value: "#a3e635" },
  { name: "Sunset Tangerine", value: "#fb923c" },
  { name: "Radiant Rose", value: "#f43f5e" },
  { name: "Champagne Gold", value: "#fbbf24" },
];

export function KineticTextDemo() {
  const [customText, setCustomText] = useState("NOSTALGIA");
  const [selectedFont, setSelectedFont] = useState(FONT_OPTIONS[1]);
  const [selectedColor, setSelectedColor] = useState("#ffffff");
  const [fontSize, setFontSize] = useState(5.5);
  const [baseWeight, setBaseWeight] = useState(300);
  const [midWeight, setMidWeight] = useState(600);
  const [peakWeight, setPeakWeight] = useState(900);
  const [liftOnHover, setLiftOnHover] = useState(true);

  const handleReset = () => {
    setCustomText("NOSTALGIA");
    setSelectedFont(FONT_OPTIONS[1]);
    setSelectedColor("#ffffff");
    setFontSize(5.5);
    setBaseWeight(300);
    setMidWeight(600);
    setPeakWeight(900);
    setLiftOnHover(true);
  };

  return (
    <div className="kt-demo-container">
      {/* Header */}
      <div className="kt-demo-header">
        <div className="kt-demo-badge">
          <span className="kt-badge-indicator" />
          Magic UI &bull; Variable Typography
        </div>
        <h1 className="kt-demo-title">Kinetic Text</h1>
        <p className="kt-demo-subtitle">
          Pure CSS kinetic character wave typography. Characters interpolate across variable
          font weight axes with harmonic sibling ripples and micro-lift physics on hover.
        </p>
      </div>

      {/* Main Interactive Stage */}
      <div className="kt-stage-card">
        <div className="kt-stage-toolbar">
          <div className="kt-stage-telemetry">
            <div className="kt-telemetry-item">
              <span className="kt-telemetry-dot" />
              <span>Font:</span>
              <strong>{selectedFont.name}</strong>
            </div>
            <div className="kt-telemetry-item">
              <span>Weights:</span>
              <strong>{baseWeight} &rarr; {peakWeight}</strong>
            </div>
            <div className="kt-telemetry-item">
              <span>Length:</span>
              <strong>{customText.length} chars</strong>
            </div>
          </div>

          <button
            className="kt-reset-btn"
            onClick={handleReset}
            title="Reset to default settings"
          >
            Reset
          </button>
        </div>

        {/* Live Canvas Area */}
        <div className="kt-canvas-area">
          <KineticText
            text={customText}
            as="h1"
            baseWeight={baseWeight}
            midWeight={midWeight}
            peakWeight={peakWeight}
            liftDistance={liftOnHover ? "-0.08em" : "0em"}
            style={{
              fontFamily: selectedFont.family,
              fontSize: `clamp(2rem, ${fontSize}vw, ${fontSize * 1.2}rem)`,
              color: selectedColor,
              justifyContent: "center",
              lineHeight: 1.15,
            }}
          />

          <div className="kt-canvas-hint">
            <span className="kt-hint-badge">Hover</span> Glide your cursor across characters to trigger the weight wave
          </div>
        </div>
      </div>

      {/* Studio Controls Panel */}
      <div className="kt-controls-panel">
        <div className="kt-controls-grid">
          {/* Custom Text */}
          <div className="kt-control-group">
            <div className="kt-control-label">
              <span>Typography Content</span>
              <span className="kt-control-val">{customText.length} chars</span>
            </div>
            <input
              type="text"
              className="kt-text-input"
              value={customText}
              onChange={(e) => setCustomText(e.target.value.toUpperCase() || "A")}
              placeholder="ENTER TYPOGRAPHY..."
            />
            <div className="kt-chips-row" style={{ marginTop: "0.35rem" }}>
              {SAMPLE_WORDS.map((w) => (
                <button
                  key={w}
                  className={`kt-chip-btn ${customText === w ? "active" : ""}`}
                  onClick={() => setCustomText(w)}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          {/* Typeface Selector */}
          <div className="kt-control-group">
            <div className="kt-control-label">
              <span>Variable Typeface</span>
              <span className="kt-control-val">{selectedFont.name}</span>
            </div>
            <div className="kt-chips-row">
              {FONT_OPTIONS.map((f) => (
                <button
                  key={f.name}
                  className={`kt-chip-btn ${selectedFont.name === f.name ? "active" : ""}`}
                  onClick={() => setSelectedFont(f)}
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>

          {/* Color Palette */}
          <div className="kt-control-group">
            <div className="kt-control-label">
              <span>Color Theme</span>
              <span className="kt-control-val">{selectedColor}</span>
            </div>
            <div className="kt-colors-row">
              {COLOR_SWATCHES.map((swatch) => (
                <button
                  key={swatch.name}
                  className={`kt-color-swatch ${selectedColor === swatch.value ? "active" : ""}`}
                  style={{
                    backgroundColor: swatch.value,
                    color: swatch.value,
                  }}
                  onClick={() => setSelectedColor(swatch.value)}
                  title={swatch.name}
                  aria-label={swatch.name}
                />
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div className="kt-control-group">
            <div className="kt-control-label">
              <span>Scale Size</span>
              <span className="kt-control-val">{fontSize.toFixed(1)}vw</span>
            </div>
            <input
              type="range"
              className="kt-range-slider"
              min="2.5"
              max="9"
              step="0.2"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
            />
          </div>

          {/* Base Weight */}
          <div className="kt-control-group">
            <div className="kt-control-label">
              <span>Resting Base Weight</span>
              <span className="kt-control-val">{baseWeight}</span>
            </div>
            <input
              type="range"
              className="kt-range-slider"
              min="200"
              max="500"
              step="50"
              value={baseWeight}
              onChange={(e) => setBaseWeight(Number(e.target.value))}
            />
          </div>

          {/* Peak Weight */}
          <div className="kt-control-group">
            <div className="kt-control-label">
              <span>Hover Peak Weight</span>
              <span className="kt-control-val">{peakWeight}</span>
            </div>
            <input
              type="range"
              className="kt-range-slider"
              min="600"
              max="900"
              step="50"
              value={peakWeight}
              onChange={(e) => setPeakWeight(Number(e.target.value))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default KineticTextDemo;
