import React, { useState } from "react";
import { TextLoop } from "./ui/text-loop";
import "./TextLoopDemo.css";

const SHAPES = [
  { id: "wave", label: "Wave" },
  { id: "infinity", label: "Infinity" },
  { id: "circle", label: "Circle" },
  { id: "arch", label: "Arch" },
  { id: "line", label: "Line" },
];

const PRESET_PHRASES = [
  "React ✦ Bits",
  "Design ✦ Motion ✦ Engineering",
  "Infinite ✦ Smooth ✦ Flow",
  "Creative ✦ Typography ✦ Animation",
];

const COLOR_THEMES = [
  { name: "Electric Violet", ribbon: "#5227FF", text: "#FFFFFF" },
  { name: "Emerald Cyber", ribbon: "#059669", text: "#FFFFFF" },
  { name: "Sunset Crimson", ribbon: "#E11D48", text: "#FFFFFF" },
  { name: "Amber Glow", ribbon: "#D97706", text: "#FFFFFF" },
  { name: "Monochrome Dark", ribbon: "#27272A", text: "#F4F4F5" },
];

export function TextLoopDemo() {
  const [shape, setShape] = useState("wave");
  const [text, setText] = useState("React ✦ Bits");
  const [speed, setSpeed] = useState(90);
  const [curviness, setCurviness] = useState(90);
  const [ribbonWidth, setRibbonWidth] = useState(86);
  const [fontSize, setFontSize] = useState(46);
  const [direction, setDirection] = useState("forward");
  const [ribbon, setRibbon] = useState(true);
  const [themeIdx, setThemeIdx] = useState(0);
  const [metrics, setMetrics] = useState({ length: 0, reps: 1 });

  const activeTheme = COLOR_THEMES[themeIdx];

  const handleReset = () => {
    setShape("wave");
    setText("React ✦ Bits");
    setSpeed(90);
    setCurviness(90);
    setRibbonWidth(86);
    setFontSize(46);
    setDirection("forward");
    setRibbon(true);
    setThemeIdx(0);
  };

  return (
    <div className="tl-demo-container">
      {/* Header */}
      <div className="tl-demo-header">
        <div className="tl-demo-badge">
          <span className="tl-badge-dot"></span>
          Interactive SVG Typography
        </div>
        <h1 className="tl-demo-title">Text Loop</h1>
        <p className="tl-demo-subtitle">
          Infinite, seamless typography looping along dynamic SVG paths with dual-textPath offset wrapping.
        </p>
      </div>

      {/* Stage Card */}
      <div className="tl-stage-card">
        <div className="tl-stage-toolbar">
          <div className="tl-stage-telemetry">
            <span className="tl-telemetry-dot"></span>
            <span className="tl-telemetry-item">
              Shape: <strong>{shape.toUpperCase()}</strong>
            </span>
            <span className="tl-telemetry-item">
              Path Length: <strong>{Math.round(metrics.length)}px</strong>
            </span>
            <span className="tl-telemetry-item">
              Reps: <strong>{metrics.reps}x</strong>
            </span>
            <span className="tl-telemetry-item">
              Velocity: <strong>{speed}px/s</strong>
            </span>
          </div>
          <button
            type="button"
            className="tl-reset-btn"
            onClick={handleReset}
            title="Reset to default settings"
          >
            Reset Defaults
          </button>
        </div>

        {/* Live Canvas Area */}
        <div className="tl-canvas-area">
          <TextLoop
            text={text}
            shape={shape}
            speed={speed}
            direction={direction}
            curviness={curviness}
            fontSize={fontSize}
            ribbon={ribbon}
            ribbonWidth={ribbonWidth}
            ribbonColor={activeTheme.ribbon}
            color={activeTheme.text}
            pauseOnHover={true}
            onMetricsChange={setMetrics}
          />

          <div className="tl-canvas-hint">
            <span className="tl-hint-badge">Hover</span>
            to pause motion
          </div>
        </div>
      </div>

      {/* Studio Controls Panel */}
      <div className="tl-controls-panel">
        <div className="tl-controls-grid">
          {/* Shape Selector */}
          <div className="tl-control-group">
            <div className="tl-control-label">
              <span>Path Geometry</span>
              <span className="tl-control-val">{shape}</span>
            </div>
            <div className="tl-chips-row">
              {SHAPES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={`tl-chip-btn ${shape === s.id ? "active" : ""}`}
                  onClick={() => setShape(s.id)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Phrase & Input */}
          <div className="tl-control-group">
            <div className="tl-control-label">
              <span>Text Phrase</span>
            </div>
            <input
              type="text"
              className="tl-text-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type phrase to loop..."
            />
            <div className="tl-chips-row">
              {PRESET_PHRASES.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  className={`tl-chip-btn ${text === p ? "active" : ""}`}
                  onClick={() => setText(p)}
                >
                  {p.split("✦")[0].trim()}
                </button>
              ))}
            </div>
          </div>

          {/* Theme / Colors */}
          <div className="tl-control-group">
            <div className="tl-control-label">
              <span>Color Theme</span>
              <span className="tl-control-val">{activeTheme.name}</span>
            </div>
            <div className="tl-colors-row">
              {COLOR_THEMES.map((theme, i) => (
                <button
                  key={theme.name}
                  type="button"
                  className={`tl-color-pill ${themeIdx === i ? "active" : ""}`}
                  onClick={() => setThemeIdx(i)}
                >
                  <span
                    className="tl-swatch-dot"
                    style={{ backgroundColor: theme.ribbon }}
                  />
                  {theme.name.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Speed */}
          <div className="tl-control-group">
            <div className="tl-control-label">
              <span>Speed & Direction</span>
              <span className="tl-control-val">
                {speed} px/s ({direction})
              </span>
            </div>
            <input
              type="range"
              className="tl-range-slider"
              min="0"
              max="240"
              step="5"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
            />
            <div className="tl-chips-row">
              <button
                type="button"
                className={`tl-chip-btn ${direction === "forward" ? "active" : ""}`}
                onClick={() => setDirection("forward")}
              >
                Forward →
              </button>
              <button
                type="button"
                className={`tl-chip-btn ${direction === "reverse" ? "active" : ""}`}
                onClick={() => setDirection("reverse")}
              >
                ← Reverse
              </button>
            </div>
          </div>

          {/* Curviness */}
          <div className="tl-control-group">
            <div className="tl-control-label">
              <span>Curviness / Amplitude</span>
              <span className="tl-control-val">{curviness}</span>
            </div>
            <input
              type="range"
              className="tl-range-slider"
              min="0"
              max="160"
              step="5"
              value={curviness}
              onChange={(e) => setCurviness(Number(e.target.value))}
            />
          </div>

          {/* Ribbon & Width */}
          <div className="tl-control-group">
            <div className="tl-control-label">
              <span>Ribbon Stroke Width</span>
              <span className="tl-control-val">
                {ribbon ? `${ribbonWidth}px` : "Hidden"}
              </span>
            </div>
            <input
              type="range"
              className="tl-range-slider"
              min="20"
              max="140"
              step="2"
              disabled={!ribbon}
              value={ribbonWidth}
              onChange={(e) => setRibbonWidth(Number(e.target.value))}
            />
            <div className="tl-chips-row">
              <button
                type="button"
                className={`tl-chip-btn ${ribbon ? "active" : ""}`}
                onClick={() => setRibbon(!ribbon)}
              >
                {ribbon ? "Stroke Visible" : "Stroke Hidden"}
              </button>
            </div>
          </div>

          {/* Font Size */}
          <div className="tl-control-group">
            <div className="tl-control-label">
              <span>Font Size</span>
              <span className="tl-control-val">{fontSize}px</span>
            </div>
            <input
              type="range"
              className="tl-range-slider"
              min="24"
              max="68"
              step="2"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default TextLoopDemo;
